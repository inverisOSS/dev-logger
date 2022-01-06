export interface Colors {
  [name: string]: string
}

export interface Levels {
  [name: string]: string
}

export interface Options {
  colors: Colors
  group: string
  levels: Levels
  name: string
  logLevel: number

  upperCaseLevelName: boolean
  padStartLevelName: boolean
  padEndLevelName: boolean
  withDate: boolean
  withGroup: boolean
  withName: boolean
}

export default class Logger {
  constructor(options?: Options | string)
  setColors(colors: Colors): void
  setGroup(group?: string): void
  setName(name?: string): void
  setLevels(levels: Levels): void
  setLogLevel(level: number): void
  formatterInit(): void
  formatterOptions(level: number): void
  formatterGroup(group: string): string
  formatterDate(): string
  formatterLine(line: string): string
  formatterOutput(args: any): string
  _createLogMethod(level: number): (...args: any[]) => void;
  private _createMethods(): void
  private _deleteMethods(): void
  private _getColorFunc(key: string): (content: string) => string
  [args: string]: (...args: any[]) => void
}
