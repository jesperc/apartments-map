import faunadb from 'faunadb';
import axios from 'axios';

import secrets from '../secrets';
import { getItem, setItem } from '../util/storage';

const storageApartmentsKey = 'ag-apartments';
const storageCoordinatesKey = 'ag-coordinates';

export const getAllApartments = async () => {
    const storedApartments = getItem(storageApartmentsKey);
    if (storedApartments) {
        return storedApartments;
    }
    
    try {
        const q = faunadb.query;

        // connect to faunadb client
        const client = new faunadb.Client(
            { secret: secrets.faunadbSecret }
        );
     
        // get all references from index getAllReferencesFromIndex
        const refs = await client.query(
            q.Paginate(q.Match(q.Index('all_apartments')))
        );         
        const rows = refs.data.map(ref => q.Get(ref));

        // get all instances from references
        let instances = await client.query(rows);
        instances = instances
            .filter(instance => instance.data.applicant === secrets.socialSecurityNumber)
            .map(instance => instance.data);

        setItem(
            storageApartmentsKey, 
            instances.map(item => ({
                objectNumber: item.objectNumber, 
                address: item.address, 
                rooms: item.rooms, 
                area: item.area, 
                rent: item.rent, 
                created: item.created
            }))
        );

        return instances;
    } catch (error) {
        console.log(`error when retrieving all apartments: ${error}`);
        throw error;
    }
};

export const getCoordinates = async (apartments) => {
    const storedCoordinates = getItem(storageCoordinatesKey);
    if (storedCoordinates) {
        return storedCoordinates;
    }

    try {
        const items = [];
        for (let apartment of apartments) {
            const place = apartment.address.includes(',')
                ? apartment.address
                : `${apartment.address}, Stockholm`;
            const url = `https://api.opencagedata.com/geocode/v1/json?q=${place}&key=${secrets.openCageApiKey}`;
            const result = await axios.get(url);
            const scores = result.data.results.map(item => item.confidence);
            const highestScore = Math.max(...scores);
            const target = result.data.results.filter(item => item.confidence === highestScore)[0];

            if (target.formatted.includes('Stockholm Municipality')) {
                continue;
            }

            items.push({
                objectNumber: apartment.objectNumber,
                lat: target.geometry.lat,
                lng: target.geometry.lng,
            });
        }
        setItem(storageCoordinatesKey, items);
        return items;
    } catch (error) {
        console.log(`error when retrieving coordinates: ${error}`);
    }
};