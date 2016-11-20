const React = require('react')

const CoffeeScript = require('coffee-script_compiler')

const sandboxHTML = require('html!./sandbox.html')

const CoffeeScriptToObjectEngine = React.createClass({
  componentDidMount () {
    window.addEventListener('message', this.handleSandboxMessage)

    let jsCode = ''
    try { jsCode = CoffeeScript.compile(this.props.codeText) }
    catch(e) { return this.props.onError(e) }

    this.refs['sandbox'].contentWindow.document.write(sandboxHTML)
    this.refs['sandbox'].contentWindow.postMessage(
      {code: jsCode, state: Object.assign({}, this.props.coffeeObject)}
    , '*')
  },

  componentWillUnmount () {
    window.removeEventListener('message', this.handleSandboxMessage)
  },

  handleSandboxMessage (e) {
    if (this.state.done)
      return

    if (e.source !== this.refs['sandbox'].contentWindow)
      return

    const loc = window.location
    if (e.origin !== "null" && e.origin !== loc.protocol +'//' +loc.host)
      return

    if (e.data.error) {
      this.props.onError(e.data.error)
    }
    else this.props.onSuccess(e.data)
    this.setState({done: true})
  },

  getInitialState () {
    return { done: false }
  },

  render () {
    return (
      <span style={{display: 'none'}}>
        {
          this.state.done ? '' :
          <iframe
            ref='sandbox'
            sandbox='allow-scripts allow-same-origin'
          />
        }
      </span>
    )
  }

})

const CoffeeScriptToObject = React.createClass({
  propTypes: {

  },

  getDefaultProps() {
    return {
      codeText: '',
      initialCoffeeObject: {},
      assignToCoffeeObject: {},
      inputTimeout: 500,
    }
  },

  getInitialState() {
    return ({
      initialized: false,
      coffeeObject: {},
    })
  },

  setCoffeeObject (toAssign) {
    toAssign = toAssign || this.state.coffeeObject
    const s = {
      toAssign,
      initialized: true,
    }
    s.engineKey = new Date().getTime()
    this.setState(s)
  },

  componentWillUpdate(nextProps, nextState) {
    if (this.props.isTest !== nextProps.isTest ||
        this.props.inputDiffCheck !== nextProps.inputDiffCheck) {
      this.setCoffeeObject()
    }

    if (this.props.codeText !== nextProps.codeText) {
      clearTimeout(this.lastCounting)
      this.lastCounting = setTimeout(() => {
        this.setState(this.getInitialState(), () => {
          this.setCoffeeObject()
        })
      }, this.props.inputTimeout)
    }
  },

  render () {
    const onError = (error) => {
      // TODO add source-map for correct line and column of coffee-script error instead js error
      // const l = error.location
      // const loc = '(' +(l.first_line +1) +', ' +(l.first_column +1) +'): '
      //if (this.state.errorMessage != error.message)
      // this.setState({errorMessage: error.message})

      this.props.onError(error)
    }

    const coffeeObject = Object.assign({},
      this.props.initialCoffeeObject,
      this.state.toAssign
    )

    return (
      <CoffeeScriptToObjectEngine
        key={this.state.engineKey}
        codeText={this.props.codeText}
        coffeeObject={coffeeObject}
        onSuccess={this.props.onSuccess}
        onError={onError}
      />
    )
  }

})

module.exports = CoffeeScriptToObject
