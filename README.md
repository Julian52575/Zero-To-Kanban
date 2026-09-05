[![OpenSSF Scorecard](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FJulian52575%2FZero-To-Kanban%2Fmain%2F.readme-badges%2Fscorecard-badge.json)](.readme-badges/scorecard-results.json)

# Zero-To-Kaban

A fork of a simple To-Do list. Transcending legacy-software allegations to become a modern Kanban.

## Getting Started

> [!Note]
> The developer environment was imported from the ["Big 3 repository template"](https://github.com/Julian52575/Big-3-Governed-Template). More explanation on tools can be found there.

### Dependencies

1. **Install nix:**

```bash
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
```
then start a new terminal.  

2. **Install `uidmap` for rootless podman:**
```bash
sudo apt install uidmap
```

3. **Done.**

> [!NOTE]
> Nix reads the shell definition inside `flake.nix` to expose the tools needed for development. Every developer share the same toolset.
> In this case: expose just, podman and start a rootless podman socket.

### Running the app

> [!NOTE]
> Don't forgot the setup the `.env` file:  
> `cp .env.example .env`, then fine tune the available fields if needed.

```bash
nix develop       #  enter the dev shell
just up           #  start the docker-compose
just down         #  stop the docker-compose
just rm; just up  #  rebuild cleanly (keep volumes)
just nuke         #  nuke the containers, images and volumes after dumping the database
just              #  list all available shortcuts
```

### Working on the app

**WIP**

The app lives under `src/`.  
Tests lives under `specs/`.

### Troubleshoot

#### Nix Temporary file error

Nix might get confused about the current `TMPDIR`, unset the variable using `TMPDIR=` to start fresh:  

```
julian@RulianPC:~/Zero-To-Kaban$ nix develop 
warning: Git tree '/home/julian/Zero-To-Kaban' is dirty
error: creating temporary file '/tmp/nix-shell.7utCeg/nix-shell.WbVMmn': No such file or directory
julian@RulianPC:~/Zero-To-Kaban$ TMPDIR=
julian@RulianPC:~/Zero-To-Kaban$ nix develop 
warning: Git tree '/home/julian/Zero-To-Kaban' is dirty
Agent pid 5083
podman: started detached API service (pid 5165, stops when this shell exits)
dev shell ready -- run 'just' to see available commands. Using podman version 5.4.1
julian@RulianPC:~/Zero-To-Kaban$
```

#### Cleanup Nix-used diskspace

> [!TIP]
> Nix can get very greedy, I recommend running this command at least once a month.

You can delete unused nix files using `nix-collect-garbage`

```
julian@RulianPC:~/Zero-To-Kaban$ nix-collect-garbage
[...]
deleting '/nix/store/lwn1dlam3b9zmxfx9fn3bymfrn03vr2c-setup-hook.sh'
deleting unused links...
note: currently hard linking saves -0.00 MiB
5937 store paths deleted, 5674.82 MiB freed
```

## Contributing

This repository has strict ruling that must be respected by contributors:

1. No push to `main` are allowed; Use branches, issues and pull requests.
2. Commits should follow the [Conventional Commit format](https://www.conventionalcommits.org/en/v1.0.0/#summary). `feat` (x.+1.x), `fix` (x.x.+1) and `!` (+1.x.x) have an impact on release versioning and should be used accordingly.
3. Pull requests should be linked to an issue, pass Ci tests and their title must follow the Conventional commit format to be merged. PRs should be undrafted when ready for review. At least 1 external review approval is needed.
4. Release are created by merging an automatically created Pull Request.
