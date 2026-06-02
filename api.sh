# Use with . api.sh to expose the "ma" command in shell

export MINIAPPS_MA_MODE=true

_ma_usage() {
  echo "2d3's MiniApps CLI"
  echo
  echo "Usage:"
  echo "    ma --help"
  echo "    ma init"
  echo "    ma <command> --help"
  echo "    ma <command> <args...>"
  echo
  echo "Commands:"
  echo "    init"
  echo "        install node packages required to build miniapps and compile CLI scripts"
  echo "    add <project_id> <project_name> [--game]"
  echo "        add miniapp project"
  echo "    build <project_id>"
  echo "        build miniapp project (release mode)"
  echo "    dev <project_id>"
  echo "        build miniapp project and watch for changes, run dev server"
  echo "    list"
  echo "        list all miniapp projects"
  echo "    ls"
  echo "        alias for list"
  echo
  echo "Notes:"
  echo "    A prefix of any command name can be used in place of the full name"
  echo '    (e.g. "a" instead of "add" or "li" instead of "list")'
}

ma() {
  if [[ $# -eq 0 ]]
  then
    _ma_usage
    return 1
  elif [[ "$1" == "-h" || "$1" == "--help" ]]
  then
    _ma_usage
    return 0
  fi
  if [[ "$1" = i || "$1" = in || "$1" = ini || "$1" = init ]]
  then # init command
    npm install
  elif [[ "$1" = a || "$1" = ad || "$1" = add ]]
  then # add command
    shift
    node scripts/add.js "$@"
  elif [[ "$1" = b || "$1" = bu || "$1" = bui || "$1" = buil || "$1" = build ]]
  then # build command
    shift
    node scripts/build.js "$@"
  elif [[ "$1" = d || "$1" = de || "$1" = dev ]]
  then # dev command
    shift
    node scripts/dev.js "$@"
  elif [[ "$1" = l || "$1" = li || "$1" = lis || "$1" = list || "$1" = ls ]]
  then # list command
    shift
    node scripts/list.js "$@"
  else
    _ma_usage
    return 1
  fi
}

ma init
