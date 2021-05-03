import { apiOptions, handleResponse } from "../api";
import { fetchConceptIdSite } from "../config";

//definisjon av objekt. Egneskaper. I = interface = "kontakt"
export interface IIntendedSite {
  conceptId: string;
  pt: { term: string };
}
//array av objekter
interface IIntendedSites {
  items: IIntendedSite[];
}

export const fetchIntendedSites = (
  host: string,
  branch: string,
  conceptIdSubstance: string,
) => {
  const url = new URL(
    `${branch + fetchConceptIdSite(conceptIdSubstance)}`,
    host,
  );
  return fetch(url.toString(), apiOptions).then((response) =>
    handleResponse<IIntendedSites>(response),
  );
};
