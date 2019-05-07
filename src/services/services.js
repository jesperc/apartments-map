import faunadb from 'faunadb';

import auth from '../../auth';
import { getItem, setItem } from '../util/storage';

const storageKey = 'ag-apartments';

export const getAllApartments = async () => {
    const storedApartments = getItem(storageKey);
    if (storedApartments) {
        console.log("returning stored apartments");
        return storedApartments;
    }
    console.log("no stored apartments");
    
    try {
        const q = faunadb.query;

        // connect to faunadb client
        const client = new faunadb.Client(
            { secret: auth.faunadbSecret }
        );
     
        // get all references from index getAllReferencesFromIndex
        const refs = await client.query(
            q.Paginate(q.Match(q.Index('all_apartments')))
        );         
        const rows = refs.data.map(ref => q.Get(ref));

        // get all instances from references
        let instances = await client.query(rows);
        instances = instances
            .filter(instance => instance.data.applicant === auth.socialSecurityNumber)
            .map(instance => instance.data);

        setItem(
            storageKey, 
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