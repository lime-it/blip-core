import {flags} from '@oclif/parser'

export const machineNameFlag = flags.string({
  name: 'machine-name',
  required: true,
  description:'Name of the workspace machine.'
});

export const cpuCountFlag = flags.integer({
  name: 'cpu-count',
  required: false,
  default: 1,
  description:'Number of cpu that a machine will have.'
});

export const diskSizeMBFlag = flags.integer({
  name: 'disk-size',
  required: false,
  default: 20 * 1024,
  description:'Disk size in MB that a machine will have.'
});

export const ramSizeMBFlag = flags.integer({
  name: 'ram-size',
  required: false,
  default: 2 * 1024,
  description:'Ram size in MB that a machine will have.'
})

export const shareHostPathFlag = flags.string({
  name: 'share-host-path',
  required: true,
  description:'Path of the shared folder on the host.'
});

export const shareGuestPathFlag = flags.string({
  name: 'share-guest-path',
  required: true,
  description:'Path of the shared folder on the guest.'
});