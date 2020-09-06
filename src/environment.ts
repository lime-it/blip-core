const isWin = process.platform === "win32";

export const environment = {
  configDir: process.env.XDG_CONFIG_HOME !== undefined ? process.env.XDG_CONFIG_HOME : isWin ? `${process.env.LOCALAPPDATA}\\blip` : `${process.env.HOME}/.config/blip`,
  hostsFilePath: isWin ? "C:\\Windows\\System32\\drivers\\etc\\hosts" : "/etc/hosts"
}
