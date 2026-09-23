{
  description = "Local k3s + Argo CD tooling for the deployment/ Helm chart";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" ];
      forAllSystems = f:
        nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShellNoCC {
          # Everything needed to run a rootless k3s node locally. Argo CD
          # setup itself is NOT done here -- see `just up-local` /
          # `just up-gitops` in deployment/justfile once the node is up.
          # k3s ships its own Traefik (with the IngressRoute CRD our chart's
          # templates/ingressroute.yaml needs) -- nothing extra to install
          # for ingress.
          packages = with pkgs; [
            k3s
            kubectl
            kubernetes-helm
            argocd
            just

            # rootless k3s needs these for its own network/cgroup namespace
            # (see `k3s server --rootless`), on top of what the root
            # flake.nix's rootless Podman shell already provides.
            rootlesskit
            slirp4netns
            conntrack-tools
            iptables

            jq
            util-linux # setsid -- detaches the background k3s server from the tty
          ];

          # Auto-starts a rootless k3s node, so `nix develop --directory
          # deployment/` alone gets you a running cluster. A second shell
          # entering the same dir reuses the already-running node instead of
          # starting a second one. Once the node is ready, run
          # `just up-local` (sync from your local working tree) or
          # `just up-gitops` (sync from git, the normal Argo CD flow) to
          # bootstrap Argo CD against it.
          #
          # k3s is launched via `systemd-run --user --scope`, NOT a plain
          # backgrounded process. On WSL (and possibly other setups where
          # the login shell isn't created through a real systemd/logind
          # session), a bare child process inherits an undelegated cgroup
          # (commonly /init.scope) even when user@<uid>.service itself is
          # correctly delegated -- k3s then fails with "delegated cgroup v2
          # controllers are required for rootless". `systemd-run --user
          # --scope` asks the (lingering) user systemd manager to create the
          # process directly inside the delegated tree instead, sidestepping
          # wherever the shell itself happens to live. `-p Delegate=yes` is
          # required so the scope's cgroup subtree is actually writable by
          # the child -- without it k3s fails with "failed to find cpuset
          # cgroup (v2)" even when the parent slices have cpuset enabled in
          # cgroup.subtree_control. The `-p CPUWeight=` / `-p AllowedCPUs=`
          # / `-p IOWeight=` properties are required too (not just e.g.
          # `-p CPUAccounting=yes`) -- in cgroup v2, systemd only actually
          # turns on the `cpu`/`cpuset` controllers for real resource-control
          # properties; accounting-only flags don't count, since basic
          # cpu.stat is free without the controller.
          #
          # See the "Configuration" block at the top of shellHook below for
          # the env vars you can set to change its behavior.
          shellHook = ''
            # --- Configuration: env vars you can set before `nix develop` ---
            #
            #   K3S_NO_AUTOSTART=1    Skip starting k3s entirely (manual mode);
            #                         prints the systemd-run command instead.
            #
            #   ZTK_STATE_DIR=<path>  Where k3s's own state (containerd overlayfs
            #                         snapshots, kubeconfig) lives. Kept OUTSIDE
            #                         the flake's source directory on purpose:
            #                         `nix develop` has to copy/hash that
            #                         directory into the Nix store, and without
            #                         git-aware filtering (e.g. when deployment/
            #                         is dropped onto a server as a plain
            #                         directory, not a git clone) that's a
            #                         literal recursive copy -- which chokes
            #                         with "Permission denied" on containerd's
            #                         overlayfs snapshot work dirs (mode 000,
            #                         only readable from inside the rootless
            #                         user namespace that created them).
            #                         Defaults to "$XDG_STATE_HOME/zero-to-kanban-k3s".
            #
            #   XDG_STATE_HOME=<path> Standard XDG override, used as the parent
            #                         of the default state dir above when
            #                         ZTK_STATE_DIR isn't set. Falls back to
            #                         "$HOME/.local/state" if unset.
            K3S_NO_AUTOSTART="''${K3S_NO_AUTOSTART:-}"
            STATE_DIR="''${ZTK_STATE_DIR:-''${XDG_STATE_HOME:-$HOME/.local/state}/zero-to-kanban-k3s}"
            # -------------------------------------------------------------------

            echo "deployment shell ready -- k3s $(k3s --version | head -n1)"

            # Rootless k3s can't enlarge its netlink send buffer past this
            # (SO_SNDBUFFORCE needs host root), so with the 208 KB default
            # the NetworkPolicy controller's iptables-restore batches fail
            # with "Message too long" and only some policies get applied.
            # Host-wide setting -- see "Requirements" in README.md.
            if [ "$(cat /proc/sys/net/core/wmem_default)" -lt 4194304 ]; then
              echo "WARNING: net.core.wmem_default is $(cat /proc/sys/net/core/wmem_default), NetworkPolicies will be applied only partially." >&2
              echo "  fix: echo 'net.core.wmem_default = 4194304' | sudo tee /etc/sysctl.d/90-rootless-k3s.conf && sudo sysctl --system" >&2
            fi

            if [ -n "$K3S_NO_AUTOSTART" ]; then
              echo "K3S_NO_AUTOSTART set -- start it yourself (see the comment above shellHook"
              echo "in flake.nix for why plain 'k3s server --rootless ...' can fail on WSL):"
              echo "  setsid systemd-run --user --unit=zero-to-kanban-k3s --scope --collect \\"
              echo "    -p Delegate=yes -p CPUWeight=100 -p AllowedCPUs=0-\$((\$(nproc)-1)) -p IOWeight=100 \\"
              echo "    -- k3s server --rootless --write-kubeconfig $STATE_DIR/k3s.yaml --write-kubeconfig-mode 644 --data-dir $STATE_DIR/.k3s"
              return 2>/dev/null || exit 0
            fi

            # `nix develop --directory deployment/` (or `nix develop
            # ./deployment` from the repo root) does NOT cd you into
            # deployment/ -- $PWD stays wherever you invoked it from. Find
            # this flake's own directory instead of assuming $PWD.
            DEPLOY_DIR="$PWD"
            if [ ! -d "$DEPLOY_DIR/argocd" ] && [ -d "$DEPLOY_DIR/deployment/argocd" ]; then
              DEPLOY_DIR="$DEPLOY_DIR/deployment"
            fi
            if [ ! -d "$DEPLOY_DIR/argocd" ]; then
              echo "k3s: can't locate the deployment/ directory from \$PWD ($PWD) -- run this from the repo root or deployment/ itself." >&2
              return 2>/dev/null || exit 1
            fi

            # Current branch, exported so `just up-local` can point the
            # file:// Argo CD Application at it instead of hardcoding
            # `main` -- lets you sync a dev branch without committing to
            # main. Falls back to "main" if HEAD is detached.
            export GIT_BRANCH="$(git -C "$DEPLOY_DIR" symbolic-ref --short -q HEAD || echo main)"
            echo "GIT_BRANCH=$GIT_BRANCH (used by 'just up-local' as the Argo CD targetRevision)"

            KUBECONFIG_PATH="$STATE_DIR/k3s.yaml"
            export KUBECONFIG="$KUBECONFIG_PATH"
            DATA_DIR="$STATE_DIR/.k3s"
            UNIT="zero-to-kanban-k3s"
            mkdir -p "$DATA_DIR"

            _api_ready() {
              KUBECONFIG="$KUBECONFIG_PATH" kubectl get --raw='/readyz' >/dev/null 2>&1
            }
            _unit_active() {
              systemctl --user is-active --quiet "$UNIT.scope" 2>/dev/null
            }
            # Bails out as soon as the scope dies (e.g. k3s crashes on
            # startup) instead of polling readyz for the full timeout --
            # --collect means a dead scope disappears from `systemctl`
            # within a second or two, so this catches a crash fast.
            _wait_ready() {
              seen_active=""
              for _ in $(seq 120); do
                _api_ready && return 0
                if _unit_active; then
                  seen_active=1
                elif [ -n "$seen_active" ]; then
                  echo "k3s: unit $UNIT.scope is no longer active -- it crashed on startup, check $DATA_DIR/k3s.log" >&2
                  return 1
                fi
                sleep 1
              done
              return 1
            }

            owned=""
            if _unit_active; then
              echo "k3s: reusing already-running node (systemd --user unit $UNIT.scope)"
            else
              echo "k3s: starting rootless node (first boot can take a minute)..."
              CPU_RANGE="0-$(( $(nproc) - 1 ))"
              echo "+ setsid systemd-run --user --unit=$UNIT --scope --collect -p Delegate=yes -p CPUWeight=100 -p AllowedCPUs=$CPU_RANGE -p IOWeight=100 -- k3s server --rootless --write-kubeconfig $KUBECONFIG_PATH --write-kubeconfig-mode 644 --data-dir $DATA_DIR (backgrounded, log: $DATA_DIR/k3s.log)"
              # setsid: puts systemd-run (and the k3s it execs into via
              # --scope) in its own session, detached from this terminal.
              setsid systemd-run --user --unit="$UNIT" --scope --collect \
                -p Delegate=yes -p CPUWeight=100 -p "AllowedCPUs=$CPU_RANGE" -p IOWeight=100 \
                -- k3s server --rootless \
                     --write-kubeconfig "$KUBECONFIG_PATH" --write-kubeconfig-mode 644 \
                     --data-dir "$DATA_DIR" \
                >"$DATA_DIR/k3s.log" 2>&1 &
              disown 2>/dev/null || true
              owned=1
              if _wait_ready; then
                echo "k3s: node ready (unit $UNIT.scope, stops when this shell exits; log: $DATA_DIR/k3s.log)"
              else
                echo "k3s: node did not become ready in time -- check $DATA_DIR/k3s.log" >&2
              fi
              # Only the shell that started it tears it down.
              trap '
                if [ -n "'"$owned"'" ]; then
                  systemctl --user stop "'"$UNIT"'.scope" >/dev/null 2>&1 || true
                fi
              ' EXIT
            fi
          '';
        };
      });
    };
}
