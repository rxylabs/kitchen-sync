'use strict';

var React = require('react');

var socket = io.connect();

var Order = React.createClass({
  toggleOrderStatus() {
    this.props.toggleOrderStatus(this.props.orderID);
  },

  handleOrderDelete() {
    this.props.handleOrderDelete(this.props.orderID);
  },

	render() {
		return (
			<div className='order'>
        <div className='btn ready shadow' onClick={this.toggleOrderStatus}>{this.props.ready ? '✔' : ''}</div>
        <div className='text shadow'>{this.props.text}</div>
        <div className='btn delete shadow' onClick={this.handleOrderDelete}>X</div>
			</div>
		);
	}
});

var OrderList = React.createClass({
	render() {
		return (
      <div className="orders-box">
      {
        this.props.orders.map((order) => {
          return (
            <Order
              key={order.id}
              text={order.text} 
              orderID={order.id}
              ready={order.ready}
              timestamp={order.timestamp}
              toggleOrderStatus={this.props.toggleOrderStatus}
              handleOrderDelete={this.props.handleOrderDelete}
            />
          );
        })
      } 
      </div>
		);
	}
});

var OrderForm = React.createClass({

	getInitialState() {
		return {text: ''};
	},

  getTimeStamp() {
    var a = new Date();
    var hours = a.getHours();
    var minutes = a.getMinutes();
    return (hours > 12 ? hours - 12 : hours) + ':' + minutes + ' ' + (hours > 12 ? 'pm' : 'am');
  },

  getUID () {
    return Math.floor(Math.random() * 5) + '' + +new Date();
  },

	handleSubmit(e) {
    e.preventDefault();
    if (this.state.text !== '') {
      var order = {
        id: this.getUID(),
        ready: false,
        text: this.state.text,
        timestamp: this.getTimeStamp()
      }
      this.props.onOrderSubmit(order);	
      this.setState({ text: '' });
    }
	},

	changeHandler(e) {
		this.setState({ text : e.target.value });
	},

	render() {
		return(
			<div className='order-form'>
				<form onSubmit={this.handleSubmit}>
          <div className="input-group">
            <input
              onChange={this.changeHandler}
              value={this.state.text}
              placeholder="Enter order keyword"
              className="shadow"
            />
            <div className="submit shadow" onClick={this.handleSubmit}>+</div>
          </div>
				</form>
			</div>
		);
	}
});


var KitchenSyncApp = React.createClass({

	getInitialState() {
    var savedState =  localStorage.getItem('orders');
    var orders = [];
    if( savedState ) {
      orders = JSON.parse(savedState);
    }
		return {orders: orders, text: ''};
	},

	componentDidMount() {
		socket.on('update:state', this._setOrderState);
	},

  _setOrderState(orders) {
    this.setState({orders});
  },

  toggleOrderStatus(orderID) {
    var {orders} = this.state;
    var updatedOrders = orders.map((m) => {
      if (m.id === orderID) {
        m.ready = !m.ready;
      }
      return m;
    });
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    this.setState({ orders: updatedOrders });
		socket.emit('update:state', updatedOrders);
  },

  handleOrderDelete(orderID) {
    var {orders} = this.state;
    var updatedOrders = [];
    orders.map((m) => {
      if (m.id !== orderID) {
        updatedOrders.push(m);
      }
    });
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    this.setState({ orders: updatedOrders });
		socket.emit('update:state', updatedOrders);
  },

	handleOrderSubmit(order) {
		var {orders} = this.state;

		orders.unshift(order);
    localStorage.setItem('orders', JSON.stringify(orders));
		this.setState({orders});
		socket.emit('update:state', orders);
	},


	render() {
		return (
			<div>
        <div className="heading">
          <img src="/img/logo.svg" /> 
          <h2>Order Entry</h2>
        </div>
				<OrderForm
					onOrderSubmit={this.handleOrderSubmit}
				/>
        <OrderList
          orders={this.state.orders}
          toggleOrderStatus={this.toggleOrderStatus}
          handleOrderDelete={this.handleOrderDelete}
        />
			</div>
		);
	}
});

React.render(<KitchenSyncApp/>, document.getElementById('app'));
