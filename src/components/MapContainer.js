import React, { Component } from 'react';

import { getAllApartments, getCoordinates } from '../services/services';
import MapView from './MapView';

export default class MapContainer extends Component {
    componentWillMount() {
        this.setState({
            isLoading: true,
            errorMessage: null,
            apartments: []
        });
    }

    async componentDidMount() {
        try {
            const apartments = await getAllApartments();
            const coordinates = await getCoordinates(apartments);

            for (let coordinate of coordinates) {
                let apartment = apartments.find((item) => item.objectNumber === coordinate.objectNumber);
                if (apartment != null) {
                    apartment.lat = coordinate.lat;
                    apartment.lng = coordinate.lng;
                }
            }

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

        return <MapView list={this.state.apartments} />
    }
}