const components = import.meta.glob('../../components/*.vue', { eager: true })

export const discoverComponents = () => {
  const result: Record<string, any> = {}
  
  for (const path in components) {
    const componentName = path.split('/').pop()?.replace(/\.\w+$/, '')
    if (componentName) {
      result[componentName] = (components[path] as any).default
    }
  }
  
  return result
}
