var React = require('react')
var ReactDOM = require('react-dom')

var CoffeeScriptToObject = require('./CoffeeScriptToObject.jsx')

var App = React.createClass({
  getInitialState() {
    return {
      codeText: 'n = 3\n@a = n + 4',
      coffeeObject: {},
      errorMessage: '',
    }
    
  },

  render () {
    return (
      <div>
        <textarea rows={10} cols={40}
          value={this.state.codeText}
          onChange={(e)=>this.setState({codeText: e.target.value})}
        />

        <div>{JSON.stringify(this.state.coffeeObject)}</div>
        <div>{this.state.errorMessage}</div>

        <CoffeeScriptToObject
          codeText={this.state.codeText}
          onSuccess={(coffeeObject)=>this.setState({coffeeObject, errorMessage: ''})}
          onError={(error)=>this.setState({errorMessage: error.message})}
        />
      </div>
    )
  }
})

ReactDOM.render(<App />, document.getElementById('app'))
