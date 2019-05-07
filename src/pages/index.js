import React, { Component } from 'react'

import Map from '../components/MapContainer';
import { getAllApartments } from '../services/services';

export default class Index extends Component {
    async componentWillMount() {
        this.setState({
            isLoading: true,
            errorMessage: null,
            apartments: []
        });
    }

    async componentDidMount() {
        try {
            const apartments = await getAllApartments();
            this.setState({ isLoading: false, apartments });
        } catch (error) {
            const errorStr = typeof error === 'string'
                ? error
                : `${error.message} ${error.stack}`;
            this.setState({ isLoading: false, error: errorStr });
        }
    }

    render() {
        if (this.state.isLoading) {
            return <div>Loading...</div>;
        }

        if (this.state.error != null) {
            return <div>Error on load: {this.state.error}</div>
        }

        const list = this.state.apartments
            .map(item => (<div key={item.objectNumber}>{[item.address, item.rooms, item.area, item.rent].join(', ')}</div>))
            .sort();

        return <Map list={list} />;
    }
}