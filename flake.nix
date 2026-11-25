{
  description = "A flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-26.05";
    nixpkgs-unstable.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      nixpkgs-unstable,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
        unstable = import nixpkgs-unstable {
          inherit system;
          config.allowUnfree = true;
        };
        fonts = with pkgs; [ lato corefonts carlito ];
      in
      {
        devShells.default = pkgs.mkShell {
          packages = pkgs.lib.flatten [
            (with pkgs; [
              bun
              uv
              sops
            ])
            (with unstable; [
              typst
              typstyle
            ])
            fonts
          ];

          buildInputs = [ pkgs.bashInteractive ];

          shellHook = ''
            unset SOURCE_DATE_EPOCH
          '';

          env = {
            TYPST_FONT_PATHS = pkgs.lib.concatMapStringsSep ":" (f: "${f}/share/fonts") fonts;
            UV_PYTHON_PREFERENCE = "only-managed";
          };
        };
      }
    );
}
