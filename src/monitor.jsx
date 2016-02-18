'use strict';

var React = require('react');

var socket = io.connect();

var Order = React.createClass({
  render() {
    return <div className='order'>{this.props.text}</div>;
  }
});

var MonitorSyncApp = React.createClass({

  getInitialState() {
    return {orders:[]};
  },

  componentDidMount() {
    socket.on('update:state', this._setOrderState);
  },

  _setOrderState(orders) {
    this.setState({orders});
  },


  render() {
    return (
      <div className="orders-box">
        <div className="heading">
          <img src="/img/logo.svg" /> 
          <h2>Orders ready</h2>
        </div>
        <div className="orders">
          {
            this.state.orders.map((order, i) => {
              if (order.ready) {
                return (
                  <Order
                    key={i}
                    text={order.text} 
                  />
                );
              }
            })
          } 
        </div>
      </div>
    );
  }
});

React.render(<MonitorSyncApp/>, document.getElementById('app'));
