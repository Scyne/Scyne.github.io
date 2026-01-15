#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting Dawn's Environment Setup..."
echo "------------------------------------"

# 1. Install Homebrew if it isn't already installed
if ! command -v brew &> /dev/null; then
    echo "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for the current session (Apple Silicon vs Intel check)
    if [[ -f /opt/homebrew/bin/brew ]]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [[ -f /usr/local/bin/brew ]]; then
        eval "$(/usr/local/bin/brew shellenv)"
    fi
else
    echo "Homebrew is already installed."
fi

echo "Updating Homebrew..."
brew update

# 2. Install requested packages and fonts
echo "Installing packages: starship, eza, git, bat, micro, zsh-syntax-highlighting..."
brew install starship eza git bat micro zsh-syntax-highlighting

echo "Installing Nerd Font (Meslo LG)..."
brew install --cask font-meslo-lg-nerd-font

# 3. Setup Starship Configuration
echo "Configuring Starship..."
mkdir -p ~/.config

# We use 'EOF' (quoted) to prevent the shell from trying to expand the $variables inside the TOML
cat <<'EOF' > ~/.config/starship.toml
# ~/.config/starship.toml

# Inserts a blank line between shell prompts
add_newline = true

# Change command timeout from 500 to 1000 ms
command_timeout = 1000

# Change the default prompt format
format = """\
[╭╴](238) $username$hostname $directory $git_branch$git_status$fill$cmd_duration$time$battery\
$all[╰─](238)$character"""
#
# Change the default prompt characters
[character]
success_symbol = "[](238)"
error_symbol = "[](238)"

# Make fill spaces
[fill]
symbol = " "

# Shows duration for any command that takes over 2sec
[cmd_duration]
disabled = false # Disable on PWSH until [starship/issues/2482] is resolved
show_milliseconds = true
notification_timeout = 500
format = "[$duration](bold yellow) |"

# Shows current Time
[time]
disabled = false
format = '[ $time ]($style)'
style = "238"

# Shows Battery Percentage
[battery]
format = "| [$symbol$percentage]($style) "

[[battery.display]] # "bold red" style and discharging_symbol when capacity is between 0% and 10%
threshold = 10
style = "bold red"

[[battery.display]] # "bold yellow" style and discharging_symbol when capacity is between 10% and 30%
threshold = 30
style = "bold yellow"

[[battery.display]] # "bold green" style and discharging_symbol when capacity is between 30% and 100%
threshold = 100
style = "bold green"

# Shows an icon that should be included by zshrc script based on the distribution or os
[env_var.STARSHIP_DISTRO]
format = '[$env_value](white)'
variable = "STARSHIP_DISTRO"
disabled = false

# Shows the username
[username]
style_user = "white"
style_root = "white"
format = "[$user]($style) " # Default = "[$user]($style) "
disabled = false
show_always = true

[hostname]
ssh_only = true
format = "on [$hostname](bold yellow) "
disabled = false

[directory]
truncation_length = 3
truncation_symbol = "…/"
home_symbol = " ~"
read_only_style = "197"
read_only = "  "
format = "@ [$path]($style)[$read_only]($read_only_style) "

[git_branch]
symbol = " "
format = "via [$symbol$branch]($style) "
truncation_length = 4
truncation_symbol = "…/"
style = "bold green"

[git_metrics]
disabled = true
added_style = 'bold blue'
format = '[+$added]($added_style)/[-$deleted]($deleted_style) '

[git_status]
format = '[\($all_status$ahead_behind\)]($style) '
style = "bold green"
conflicted = "🏳"
up_to_date = " "
untracked = " "
ahead = "⇡${count}"
diverged = "⇕⇡${ahead_count}⇣${behind_count}"
behind = "⇣${count}"
stashed = " "
modified = " "
staged = '[++\($count\)](green)'
renamed = "襁 "
deleted = " "

[terraform]
format = "via [ terraform $version]($style) 壟 [$workspace]($style) "

[vagrant]
format = "via [ vagrant $version]($style) "

[docker_context]
format = "via [ $context](bold blue) "

[helm]
format = "via [ $version](bold purple) "

[python]
symbol = " "
python_binary = "python3"

[nodejs]
format = "via [ $version](bold green) "
disabled = true

[ruby]
format = "via [ $version]($style) "

[kubernetes]
format = 'via [ﴱ $context\($namespace\)](bold purple) '
disabled = false
[kubernetes.context_aliases]
"do-fra1-prod-k8s-clcreative" = " lgcy-1"
"infra-home-kube-prod-1" = " prod-1"
"infra-home-kube-prod-2" = " prod-2"
"infra-cloud-kube-prod-1" = " prod-1"
"infra-cloud-kube-test-1" = " test-1"
EOF

echo "Starship configuration written."

# 4. Configure Zsh
echo "Configuring .zshrc..."

# Backup existing zshrc if it exists
if [ -f ~/.zshrc ]; then
    echo "Backing up existing .zshrc to .zshrc.bak..."
    mv ~/.zshrc ~/.zshrc.bak
fi

# Write the new zshrc using quoted heredoc
cat <<'EOF' > ~/.zshrc
### Dawn's zsh dotfile ###
#         1-15-26        #
##########################

# Configuration Variables
# These are hardcoded so the toggle functions can find and replace them via sed
export EASY_LS="false"
export CLEARSCREEN_ON_SOURCE="false"
export AUTOCOMPLETE="false"

# I love Micro
export EDITOR='micro'
export VISUAL='micro'

### ALIASES ###

# cat to bat
alias cat='bat'

# git
alias addup='git add -u'
alias addall='git add .'
alias branch='git branch'
alias checkout='git checkout'
alias clone='git clone'
alias commit='git commit -m'
alias fetch='git fetch'
alias pull='git pull origin'
alias push='git push origin'
alias stat='git status'
alias tag='git tag'
alias newtag='git tag -a'

# --- Persistent Toggle Functions ---

# Help Command
termtoggles() {
    echo " "
    echo "🛠️  Dawn's Terminal Toggles Help"
    echo "-----------------------------------------------------"
    echo "1. toggle_ls          [Current: $EASY_LS]"
    echo "   Action: Switches 'ls' between standard output and"
    echo "           'eza' (colorful, rich file listing)."
    echo " "
    echo "2. toggle_cls         [Current: $CLEARSCREEN_ON_SOURCE]"
    echo "   Action: Toggles whether the screen clears automatically"
    echo "           when you open a new terminal or reload settings."
    echo " "
    echo "3. toggle_autocomplete [Current: $AUTOCOMPLETE]"
    echo "   Action: Toggles the dropdown menu for command suggestions."
    echo "           (Note: Restarts the shell automatically)."
    echo "-----------------------------------------------------"
    echo " "
}

# Toggle EASY_LS (Persists across sessions)
toggle_ls() {
    if grep -q 'export EASY_LS="true"' ~/.zshrc; then
        sed -i '' 's/export EASY_LS="true"/export EASY_LS="false"/' ~/.zshrc
        echo "eza disabled. Reloading configuration..."
    else
        sed -i '' 's/export EASY_LS="false"/export EASY_LS="true"/' ~/.zshrc
        echo "eza enabled. Reloading configuration..."
    fi
    source ~/.zshrc
}

# Toggle CLEARSCREEN_ON_SOURCE (Persists across sessions)
toggle_cls() {
    if grep -q 'export CLEARSCREEN_ON_SOURCE="true"' ~/.zshrc; then
        sed -i '' 's/export CLEARSCREEN_ON_SOURCE="true"/export CLEARSCREEN_ON_SOURCE="false"/' ~/.zshrc
        echo "Clear-on-source disabled. Reloading configuration..."
    else
        sed -i '' 's/export CLEARSCREEN_ON_SOURCE="false"/export CLEARSCREEN_ON_SOURCE="true"/' ~/.zshrc
        echo "Clear-on-source enabled. Reloading configuration..."
    fi
    source ~/.zshrc
}

# Toggle Autocomplete (Persists across sessions)
# Note: Uses 'exec zsh' to fully restart shell so the plugin is unloaded from memory
toggle_autocomplete() {
    if grep -q 'export AUTOCOMPLETE="true"' ~/.zshrc; then
        sed -i '' 's/export AUTOCOMPLETE="true"/export AUTOCOMPLETE="false"/' ~/.zshrc
        echo "Autocomplete disabled. Restarting shell..."
    else
        sed -i '' 's/export AUTOCOMPLETE="false"/export AUTOCOMPLETE="true"/' ~/.zshrc
        echo "Autocomplete enabled. Restarting shell..."
    fi
    exec zsh
}

# --- Logic Blocks ---

# Changing "ls" to "eza" based on config
if [[ "$EASY_LS" == "true" ]]; then
    alias ls='eza -al --color=always --group-directories-first' # my preferred listing
    alias la='eza -a --color=always --group-directories-first'  # all files and dirs
    alias ll='eza -l --color=always --group-directories-first'  # long format
    alias lt='eza -aT --color=always --group-directories-first' # tree listing
    alias l.='eza -a | egrep "^\."'
else
    # Ensure standard ls is used if toggled off
    unalias ls 2>/dev/null
    unalias la 2>/dev/null
    unalias ll 2>/dev/null
    unalias lt 2>/dev/null
    unalias l. 2>/dev/null
fi

# Colorize grep output (good for log files)
alias grep='grep --color=auto'
alias egrep='egrep --color=auto'
# alias fgrep='fgrep --color=auto'

# confirm before overwriting something
alias cp="cp -i"
alias mv='mv -i'
alias rm='rm -i'

# Download Znap, if it's not there yet.
[[ -r ~/git/znap/znap.zsh ]] ||
    git clone --depth 1 -- \
        https://github.com/marlonrichert/zsh-snap.git ~/git/znap
source ~/git/znap/znap.zsh  # Start Znap

# Setup autocomplete based on config
if [[ "$AUTOCOMPLETE" == "true" ]]; then
    znap source marlonrichert/zsh-autocomplete
fi

# Clear Screen Aliases
alias clr="clear"
alias cls="clear"

### PS1 Prompt ###

# Conditional Clear Screen
if [[ "$CLEARSCREEN_ON_SOURCE" == "true" ]]; then
    clear
fi

# Start Starship Prompt #
eval "$(starship init zsh)"

# Add Highlighting
source $(brew --prefix)/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
typeset -A ZSH_HIGHLIGHT_STYLES
ZSH_HIGHLIGHT_STYLES[command]='fg=blue'
ZSH_HIGHLIGHT_STYLES[unknown]='fg=red,bold'
export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"
export PATH="/opt/homebrew/bin:$PATH"
EOF

echo "Setup complete! Please restart your terminal or run:"
echo "source ~/.zshrc"
