const uuid = require('uuid/v4')
module.exports = class {
    constructor (isRoot, data, saniCaps) {
        this.uuid = uuid()
        this.title = ''
        this.fullFile = ''
        this.file = ''
        this.beforeHooks = []
        this.afterHooks = []
        this.tests = []
        this.suites = []
        this.passes = []
        this.failures = []
        this.pending = []
        this.skipped = []
        this.duration = 0
        this.root = isRoot
        this.rootEmpty = data.rootEmpty
        this._timeout = 0

        if (!isRoot) {
            this.title = data.title

            if (saniCaps) {
                this.title = `${this.title} (${saniCaps})`
            }
        } else {
            this.fullFile = data.fullFile
            this.file = data.fullFile
        }
    }

    addSuite (suite) {
        this.suites.push(suite)
    }

    addTest (test) {
        this.tests.push(test)
        if (test.pass) {
            this.passes.push(test.uuid)
        } else if (test.fail) {
            this.failures.push(test.uuid)
        } else if (test.pending) {
            this.pending.push(test.uuid)
            this.skipped.push(test.uuid)
        }
    }
}
