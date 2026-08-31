import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const packagesDir = join(root, 'packages')
const destination = join(root, '.package-verification')

rmSync(destination, { recursive: true, force: true })

const packages = readdirSync(packagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(packagesDir, entry.name))
  .filter((dir) => {
    try {
      const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
      return pkg.private !== true && typeof pkg.name === 'string'
    } catch {
      return false
    }
  })

if (packages.length === 0) {
  throw new Error('No publishable platform packages found')
}

for (const dir of packages) {
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
  console.log(`Packing ${pkg.name}@${pkg.version}`)
  execFileSync('pnpm', ['pack', '--pack-destination', destination], {
    cwd: dir,
    stdio: 'inherit',
  })
}

rmSync(destination, { recursive: true, force: true })
console.log(`Verified ${packages.length} publishable packages.`)
