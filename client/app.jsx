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
        <div className='text'>{this.props.text}</div>
        <div className='button-box'>
          <div className='btn ready' onClick={this.toggleOrderStatus}>{this.props.ready ? "Not Ready" : "Ready"}</div>
          <div className='btn delete' onClick={this.handleOrderDelete}>Delete</div>
        </div>
			</div>
		);
	}
});

var OrderList = React.createClass({
	render() {
		return (
      <div className="orders-box">
        <div className='orders not-ready'>
          <h2> Orders in progress: </h2>
          {
            this.props.orders.map((order) => {
              if (!order.ready) {
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
              }
            })
          } 
        </div>
        <div className='orders ready'>
          <h2> Orders ready: </h2>
          {
            this.props.orders.map((order) => {
              if (order.ready) {
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
              }
            })
          } 
        </div>
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
		var order = {
      id: this.getUID(),
			ready: false,
			text: this.state.text,
      timestamp: this.getTimeStamp()
		}
		this.props.onOrderSubmit(order);	
		this.setState({ text: '' });
	},

	changeHandler(e) {
		this.setState({ text : e.target.value });
	},

	render() {
		return(
			<div className='order-form'>
				<h3>Enter order keyword:</h3>
				<form onSubmit={this.handleSubmit}>
					<input
						onChange={this.changeHandler}
						value={this.state.text}
					/>
          <div className="btn submit" onClick={this.handleSubmit}>Add</div>
				</form>
			</div>
		);
	}
});


var KitchenSyncApp = React.createClass({

	getInitialState() {
		return {orders:[], text: ''};
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
    this.setState({ orders: updatedOrders });
		socket.emit('update:state', updatedOrders);
  },

	handleOrderSubmit(order) {
		var {orders} = this.state;

		orders.unshift(order);
		this.setState({orders});
		socket.emit('update:state', orders);
	},


	render() {
		return (
			<div>
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
