'use strict';

var React = require('react');

var socket = io.connect();

var Order = React.createClass({
	render() {
		return <div className='order'>{this.props.text}</div>;
	}
});

var OrderList = React.createClass({
	render() {
		return (
      <div className="orders-box">
        <h2>Orders ready:</h2>
        {
          this.props.orders.map((order, i) => {
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
		);
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
			<div>
        <OrderList
          orders={this.state.orders}
        />
			</div>
		);
	}
});

React.render(<MonitorSyncApp/>, document.getElementById('app'));
