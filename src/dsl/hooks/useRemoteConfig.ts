import { reactive } from 'vue'
import { IOption } from '../types/dsl'

const remoteOptions = reactive<Record<string, any[]>>({})

export const useRemoteConfig = (remoteKey: string, namespace?: string): IOption[] => {
  if (!remoteOptions[remoteKey]) {
    remoteOptions[remoteKey] = []
    // TODO: In a real app, fetch from API here
    console.log(`Fetching remote config for: ${remoteKey} in ${namespace}`)
  }
  return remoteOptions[remoteKey] as IOption[]
}

export const setRemoteOptions = (key: string, options: any[]) => {
  remoteOptions[key] = options
}
