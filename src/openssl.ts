import {mkdirSync, readdirSync, writeFile, existsSync} from 'fs-extra'
import {environment} from './environment'
import {join} from 'path';
import selfsigned = require('selfsigned');
import { BlipConf } from './config';

export class Openssl {
  static async createDomainCertificate(domain: string, global: boolean) {
    let certsPath: string;
    if(global)
      certsPath = join(environment.configDir, "certs");
    else{
      BlipConf.throwIfNotInWorkspace();
      certsPath = join(BlipConf.workspaceConfigPath, "certs");
    }

    mkdirSync(certsPath, {recursive: true})

    const pems = selfsigned.generate([
      {name: 'commonName', value: domain},
    ], {
      keySize: 2048,
      days: 730,
      algorithm: 'sha256',
    })
    await writeFile(join(certsPath, `${domain}.key`), pems.private)
    await writeFile(join(certsPath, `${domain}.crt`), pems.cert)
  }

  static domainCertificateExists(domain: string, global: boolean) {
    let certsPath: string;
    if(global)
      certsPath = join(environment.configDir, "certs");
    else{
      BlipConf.throwIfNotInWorkspace();
      certsPath = join(BlipConf.workspaceConfigPath, "certs");
    }

    if(!existsSync(certsPath))
      return false;

    const entries = readdirSync(certsPath)

    return !!entries.find(p => p.endsWith(`${domain}.key`)) && !!entries.find(p => p.endsWith(`${domain}.crt`))
  }
}
