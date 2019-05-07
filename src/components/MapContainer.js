import React, { Component } from 'react';

import MapView from './MapView';

export default class MapContainer extends Component {
    componentDidMount() {

    }

    render() {
        return <MapView {...this.props} />
    }
}