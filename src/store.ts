import JSONdb from 'simple-json-db';
import { atletik } from '../archived/atletik';
import { badminton } from '../archived/badminton';
import { basketball } from '../archived/basketball';
import { boksning } from '../archived/boksning';
import { bueskydning } from '../archived/bueskydning';
import { cykling } from '../archived/cykling';
import { esport } from '../archived/esport';
import { fodbold, fodbold_2, fodbold_3 } from '../archived/fodbold';
import { haandbold } from '../archived/haandbold';
import { motorsport } from '../archived/motorsport';
import { ol } from '../archived/ol';
import { sejlsport } from '../archived/sejlsport';
import { skisport } from '../archived/skisport';
import { tennis } from '../archived/tennis';
import { tourdefrance } from '../archived/tourdefrance';
import { vinterol } from '../archived/vinterol';
import { vm_fodbold } from '../archived/vm_fodbold';
import { vm_hhandbold } from '../archived/vm_haandbold';
import { trimString } from './linksSql';

// @ts-ignore
export const combined = [
    { key: "tv2_vm_hhandbold", data: vm_hhandbold },
    { key: "tv2_basketball", data: basketball },
    { key: "tv2_badminton", data: badminton },
    { key: "tv2_cykling", data: cykling },
    { key: "tv2_fodbold", data: fodbold },
    { key: "tv2_fodbold_2", data: fodbold_2 },
    { key: "tv2_fodbold_3", data: fodbold_3 },
    { key: "tv2_haandbold", data: haandbold },
    { key: "tv2_skisport", data: skisport },
    { key: "tv2_ol", data: ol },
    { key: "tv2_tennis", data: tennis },
    { key: "tv2_atletik", data: atletik },
    { key: "tv2_sejlsport", data: sejlsport },
    { key: "tv2_boksning", data: boksning },
    { key: "tv2_tourdefrance", data: tourdefrance },
    { key: "tv2_vinterol", data: vinterol },
    { key: "tv2_esport", data: esport },
    { key: "tv2_vm_fodbold", data: vm_fodbold },
    { key: "tv2_bueskydning", data: bueskydning },
    { key: "tv2_motorsport", data: motorsport },
] as const

const GLOBAL_KEY = "links"

export function store_archived_to_json(data: readonly { key: string, data: string[] }[], json_file: string = "./storage.json") {
    const db = new JSONdb(json_file);
    for (const k of data) {
        const key = k['key']
        if (db.has(key) === false) {
            db.set(GLOBAL_KEY, data);
        }
    }
}

export function get_archived(json_file: string = "./storage.json") {
    const db = new JSONdb(json_file);
    const links = db.get(GLOBAL_KEY);
    const arr_links = []
    // const arr_links = []
    for (const l of links) {
        arr_links.push(l.data)
    }
    return Array.from(new Set(arr_links.flat()))
}

enum LatestKeys {
    DR,
    TV
}

export function has_key_in_latest(url_key: string, json_file: string = "./storage_latest.json") {
    const db = new JSONdb(json_file);
    return db.has(url_key) === true
}   



export function store_latest_to_json(url_key: string, json_file: string = "./storage_latest.json") {
    const db = new JSONdb(json_file);
    if (db.has(url_key) === false) {
        db.set(url_key, "");
    }
}   


export function read_new_links(json_file: string = "./new_links.json") {
    const db = new JSONdb(json_file);
    const links = db.get(GLOBAL_KEY);
    return links
}   

export function get_storage(json_file: string = "./storage_latest.json") {
    const db = new JSONdb(json_file);
    //@ts-ignore
    return Object.keys(db.storage!).map(l => trimString(l))
}   

