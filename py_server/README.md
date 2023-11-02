# Eatvolution

## project init

```bash
python3 -m pip install --user pipx
python3 -m pipx ensurepath
pipx install virtualenv
# isolate environment
virtualenv .venv
source ./.venv/bin/activate
pipx install poetry
# install python packages
poetry install
```