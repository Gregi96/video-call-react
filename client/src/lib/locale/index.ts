import { en_GB } from './en_GB'
import { pl_PL } from './pl_PL'

export enum Languages {
    en_GB = 'en-GB',
    pl_PL = 'pl-PL'
}

export const languages = {
    [Languages.en_GB]: en_GB,
    [Languages.pl_PL]: pl_PL
}
