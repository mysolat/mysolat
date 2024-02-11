// Entry point for the build script in your package.json
import { Turbo } from '@hotwired/turbo-rails'
import Turn from '@domchristie/turn'
import './controllers'
Turbo.start()
Turn.start()
