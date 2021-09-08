import kebabCase from 'lodash/kebabCase';

import type { Options } from '../types';

const notAccept = [NaN, null, undefined];

const regexDoubleSlashes = /(?<=.{8})\/{2,}/g;
const regexSlashInt = /\/\?/g;

export default function buildFullUrl(opts: Options) {

    let finalUrl = '';

    if (opts.customPath && opts.id) {
        opts.customPath = opts.customPath.replace(':id', `${opts.id}`);
    }

    if (opts.baseUrl) {
        finalUrl = opts.baseUrl || '';
    }

    if (opts.baseUrl && opts.name) {
        if (opts.urlParser) {
            finalUrl = `${opts.baseUrl}/${opts.urlParser(opts.name)}`;
        } else {
            finalUrl = `${opts.baseUrl}/${kebabCase(opts.name)}`;
        }

        if (opts.id) finalUrl += `/${opts.id}`;
    }

    if (opts.customPath) {
        finalUrl = `${opts.baseUrl}/${opts.customPath}`;
    }

    if (opts.query && !opts.customPath) {
        const generatedQuery: string = createQueryString(
            opts.query,
            opts.queryStringParser
        );
        finalUrl = `${opts.baseUrl}?${generatedQuery}`;
    }

    if (opts.query && opts.customPath) {
        const generatedQuery: string = createQueryString(opts.query, null);

        finalUrl = `${opts.baseUrl}${opts.customPath}?${generatedQuery}`;
    }

    if (finalUrl.lastIndexOf('/') === finalUrl.length - 1)
        finalUrl = finalUrl.slice(0, finalUrl.length - 2);

    return finalUrl
        .replace(regexSlashInt, '?')
        .replace(regexDoubleSlashes, '/');
}

function createQueryString(query: Options, queryStringParser: any) {
    const queryList = Object.entries(query).filter(
        (element: any) => !notAccept.includes(element[1])
    );
    return queryList.reduce((acc: string, curr: any, index) => {
        if (curr[0] === 'tags') {
            acc += curr[1].reduce(
                (accumulator: string, current: string, i: number) => {
                    i >= 1 ? (accumulator += '&') : null;
                    accumulator += `tags[]=${current}`;
                    return accumulator;
                },
                ''
            );
        } else {
            index >= 1 ? (acc += '&') : null;
            let key: string = '';
            let value: string = '';

            if (queryStringParser) {
                key = queryStringParser(curr[0]);
                value = queryStringParser(curr[1]);
            } else {
                key = kebabCase(curr[0]);
                value = kebabCase(curr[1]);
            }

            acc += `${key}=${value}`;
        }
        return acc;
    }, '');
}
