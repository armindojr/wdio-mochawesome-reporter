const WDIOReporter = require('@wdio/reporter').default
const Suite = require('./suite')
const Stats = require('./stats')
const Test = require('./test')

class WdioMochawesomeReporter extends WDIOReporter {
    constructor (options) {
        options = Object.assign(options)
        super(options)
    }

    onRunnerStart (runner) {
        this.config = runner.config
        this.sanitizedCaps = runner.sanitizedCapabilities
        this.sessionId = runner.sessionId
        // mochawesome requires this root suite for HTML report generation to work properly
        this.fullFile = runner.specs[0].replace(process.cwd(), '')
        this.body = {
            stats: new Stats(runner.start),
            results: [new Suite(true, {'title': '', 'fullFile': this.fullFile})]
        }
    }

    onSuiteStart (suite) {
        this.currSuite = new Suite(false, suite, this.sanitizedCaps)
        this.body.stats.incrementSuites()
    }

    onTestStart (test) {
        this.currTest = new Test(test, this.currSuite.uuid)
        this.currTest.addSessionContext(this.sessionId)
    }

    onTestSkip (test) {
        this.currTest = new Test(test, this.currSuite.uuid)
        this.currTest.addSessionContext(this.sessionId)
    }

    onAfterCommand (cmd) {
        const isScreenshotEndpoint = /\/session\/[^/]*\/screenshot/
        if (isScreenshotEndpoint.test(cmd.endpoint) && cmd.result.value) {
            this.currTest.addScreenshotContext(cmd.result.value)
        } else if (cmd.command === 'takeScreenshot' && cmd.result.value) {
            this.currTest.addScreenshotContext(cmd.result.value)
        }
    }

    onTestEnd (test) {
        this.currTest.duration = test._duration
        this.currTest.updateResult(test)
        this.currTest.context = JSON.stringify(this.currTest.context)
        this.currSuite.addTest(this.currTest)
        this.body.stats.incrementTests(this.currTest)
    }
    
    onSuiteEnd (suite) {
        this.currSuite.duration = suite.duration
        this.body.results[0].addSuite(this.currSuite)
    }

    onRunnerEnd (runner) {
        this.body.stats.end = runner.end
        this.body.stats.duration = runner.duration
        this.write(JSON.stringify(this.body))
    }
}

exports.default = WdioMochawesomeReporter
