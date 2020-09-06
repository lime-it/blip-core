const sudo = require('sudo-prompt');

export interface SudoOutput{
  stdout:string,
  stderr:string,
  error: number
}

export class Sudo{
  static async exec(command:string, args:string[]=[]):Promise<SudoOutput>{
    return await new Promise<SudoOutput>((resolve, reject)=>{
      sudo.exec(`${command} ${args.join(' ')}`, {name: 'blip'}, (error:number, stdout:string, stderr:string)=>{
        if(error){
          reject({error, stdout, stderr});
        }
        else{
          resolve({error, stdout, stderr});
        }
      })
    });
  }
}