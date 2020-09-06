import { CLIError } from "@oclif/errors";

export interface GlobalBlipConfiguration {
  defaultDriver:string|null;
}

export interface BlipWorkspaceTemplateConfiguration {
  name: string;
  configuration: {[key:string]:any};
}

export interface BlipWorkspace{
  version: string;
  defaultMachine: string;
  machines: {[key: string]: BlipWorkspaceMachine};
  template?: BlipWorkspaceTemplateConfiguration
}

export interface BlipWorkspaceMachine{
  domains: string[];
  configuration: BlipMachineConfiguration;
  driver: string;
  attached: boolean;
}

export interface BlipMachineShareFolderInfo {
  hostPath: string;
}

export interface BlipMachineConfiguration {
  group?: string;
  cpuCount: number;
  ramMB: number;
  diskMB: number;
  sharedFolders: { [guestPath:string]: BlipMachineShareFolderInfo }
}

export abstract class ToolingDependecy{
  private _isPresent:boolean|null = null;
  abstract isPresent():Promise<boolean>;
  protected abstract toolMissingMessage():string;

  async ensurePresent():Promise<void>{
    if(this._isPresent==null){
      this._isPresent = await this.isPresent();
    }
    
    if(this._isPresent == false)
      throw new CLIError(this.toolMissingMessage());
  }
}