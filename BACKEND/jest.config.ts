import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Proporciona la ruta a tu aplicación Next.js para cargar la configuración
  dir: './',
})

// Añade cualquier configuración personalizada que se pase a Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Añade más opciones de configuración antes de que se ejecute cada prueba
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Mapeador de nombres de módulos para resolver el alias '@' en tus imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

// createJestConfig se exporta de esta manera para asegurar que next/jest pueda cargar
// la configuración de Next.js, la cual es asíncrona
export default createJestConfig(config)