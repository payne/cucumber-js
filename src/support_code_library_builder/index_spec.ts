import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import { ParameterTypeRegistry } from 'cucumber-expressions'
import supportCodeLibraryBuilder from './'
import { IdGenerator } from 'cucumber-messages'

const { uuid } = IdGenerator

describe('supportCodeLibraryBuilder', () => {
  describe('no support code fns', () => {
    beforeEach(function() {
      this.attachFn = sinon.stub()
      supportCodeLibraryBuilder.reset('path/to/project', uuid())
      this.options = supportCodeLibraryBuilder.finalize()
    })

    it('returns the default options', function() {
      expect(this.options.afterTestRunHookDefinitions).to.eql([])
      expect(this.options.afterTestCaseHookDefinitions).to.eql([])
      expect(this.options.beforeTestRunHookDefinitions).to.eql([])
      expect(this.options.beforeTestCaseHookDefinitions).to.eql([])
      expect(this.options.defaultTimeout).to.eql(5000)
      expect(this.options.stepDefinitions).to.eql([])
      expect(this.options.parameterTypeRegistry).to.be.instanceOf(
        ParameterTypeRegistry
      )
      const worldInstance = new this.options.World({
        attach: this.attachFn,
        parameters: { some: 'data' },
      })
      expect(worldInstance.attach).to.eql(this.attachFn)
      expect(worldInstance.parameters).to.eql({ some: 'data' })
    })
  })

  describe('step', () => {
    describe('without definition function wrapper', () => {
      beforeEach(function() {
        this.hook = function() {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.defineStep('I do a thing', this.hook)
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds a step definition and makes original code available', function() {
        expect(this.options.stepDefinitions).to.have.lengthOf(1)
        expect(this.options.stepDefinitions[0].code).to.eql(this.hook)
        expect(this.options.stepDefinitions[0].unwrappedCode).to.eql(this.hook)
      })
    })

    describe('with definition function wrapper', () => {
      beforeEach(function() {
        this.hook = function() {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.defineStep('I do a thing', this.hook)
        supportCodeLibraryBuilder.methods.setDefinitionFunctionWrapper(function(
          fn
        ) {
          return fn.apply(this, arguments)
        })
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds a step definition and makes original code available', function() {
        expect(this.options.stepDefinitions).to.have.lengthOf(1)
        expect(this.options.stepDefinitions[0].code).not.to.eql(this.hook)
        expect(this.options.stepDefinitions[0].unwrappedCode).to.eql(this.hook)
      })
    })
  })

  describe('After', () => {
    describe('function only', () => {
      beforeEach(function() {
        this.hook = function() {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.After(this.hook)
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds a scenario hook definition', function() {
        expect(this.options.afterTestCaseHookDefinitions).to.have.lengthOf(1)
        expect(this.options.afterTestCaseHookDefinitions[0].code).to.eql(
          this.hook
        )
      })
    })

    describe('tag and function', () => {
      beforeEach(function() {
        this.hook = function() {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.After('@tagA', this.hook)
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds a scenario hook definition', function() {
        expect(this.options.afterTestCaseHookDefinitions).to.have.lengthOf(1)
        expect(
          this.options.afterTestCaseHookDefinitions[0].options.tags
        ).to.eql('@tagA')
        expect(this.options.afterTestCaseHookDefinitions[0].code).to.eql(
          this.hook
        )
      })
    })

    describe('options and function', () => {
      beforeEach(function() {
        this.hook = function() {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.After({ tags: '@tagA' }, this.hook)
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds a scenario hook definition', function() {
        expect(this.options.afterTestCaseHookDefinitions).to.have.lengthOf(1)
        expect(
          this.options.afterTestCaseHookDefinitions[0].options.tags
        ).to.eql('@tagA')
        expect(this.options.afterTestCaseHookDefinitions[0].code).to.eql(
          this.hook
        )
      })
    })

    describe('multiple', () => {
      beforeEach(function() {
        this.hook1 = function hook1() {} // eslint-disable-line @typescript-eslint/no-empty-function
        this.hook2 = function hook2() {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.After(this.hook1)
        supportCodeLibraryBuilder.methods.After(this.hook2)
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds the scenario hook definitions in the reverse order of definition', function() {
        expect(this.options.afterTestCaseHookDefinitions).to.have.lengthOf(2)
        expect(this.options.afterTestCaseHookDefinitions[0].code).to.eql(
          this.hook2
        )
        expect(this.options.afterTestCaseHookDefinitions[1].code).to.eql(
          this.hook1
        )
      })
    })
  })

  describe('this.Before', () => {
    describe('function only', () => {
      beforeEach(function() {
        this.hook = function() {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.Before(this.hook)
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds a scenario hook definition', function() {
        expect(this.options.beforeTestCaseHookDefinitions).to.have.lengthOf(1)
        expect(this.options.beforeTestCaseHookDefinitions[0].code).to.eql(
          this.hook
        )
      })
    })

    describe('tag and function', () => {
      beforeEach(function() {
        this.hook = function() {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.Before('@tagA', this.hook)
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds a scenario hook definition', function() {
        expect(this.options.beforeTestCaseHookDefinitions).to.have.lengthOf(1)
        expect(
          this.options.beforeTestCaseHookDefinitions[0].options.tags
        ).to.eql('@tagA')
        expect(this.options.beforeTestCaseHookDefinitions[0].code).to.eql(
          this.hook
        )
      })
    })

    describe('options and function', () => {
      beforeEach(function() {
        this.hook = function() {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.Before({ tags: '@tagA' }, this.hook)
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds a scenario hook definition', function() {
        expect(this.options.beforeTestCaseHookDefinitions).to.have.lengthOf(1)
        expect(
          this.options.beforeTestCaseHookDefinitions[0].options.tags
        ).to.eql('@tagA')
        expect(this.options.beforeTestCaseHookDefinitions[0].code).to.eql(
          this.hook
        )
      })
    })

    describe('multiple', () => {
      beforeEach(function() {
        this.hook1 = function hook1() {} // eslint-disable-line @typescript-eslint/no-empty-function
        this.hook2 = function hook2() {} // eslint-disable-line @typescript-eslint/no-empty-function
        supportCodeLibraryBuilder.reset('path/to/project', uuid())
        supportCodeLibraryBuilder.methods.Before(this.hook1)
        supportCodeLibraryBuilder.methods.Before(this.hook2)
        this.options = supportCodeLibraryBuilder.finalize()
      })

      it('adds the scenario hook definitions in the order of definition', function() {
        expect(this.options.beforeTestCaseHookDefinitions).to.have.lengthOf(2)
        expect(this.options.beforeTestCaseHookDefinitions[0].code).to.eql(
          this.hook1
        )
        expect(this.options.beforeTestCaseHookDefinitions[1].code).to.eql(
          this.hook2
        )
      })
    })
  })
})
