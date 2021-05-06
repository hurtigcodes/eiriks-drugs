import debounce from "awesome-debounce-promise";
import React, { ChangeEvent, FormEvent, useEffect } from "react";
import { useAsync } from "react-async-hook";
import useConstant from "use-constant";
import { StringParam, useQueryParam } from "use-query-params";
import Concept from "../components/Concept";
import Error from "../components/Error";
import Header from "../components/Header";
import Loading from "../components/Loading";
import DrugListComponent from "../components/DrugListComponent";
import DrugAutoSuggest from "../components/DrugAutoSuggest";
import { defaultBranch, hosts, defaultConceptIdSubstance } from "../config";
import {
  fetchBranches,
  fetchIntendedSites,
  fetchReleases,
  fetchForms,
  fetchAdms,
  fetchConcepts,
  IConceptResult,
} from "../store";

type SearchProps = {
  scope: string;
};

const useSearch = () => {
  // Handle the input text state
  const [query, setQuery] = useQueryParam("q", StringParam);
  const [host, setHost] = useQueryParam("h", StringParam);
  const [branch, setBranch] = useQueryParam("b", StringParam);
  const [intendedSite, setIntendedSite] = useQueryParam("is", StringParam);
  const [form, setForm] = useQueryParam("f", StringParam);
  const [rel, setRel] = useQueryParam("r", StringParam);
  const [adm, setAdm] = useQueryParam("a", StringParam);
  const [
    conceptIdSubstance = defaultConceptIdSubstance,
    setConceptIdSubstance,
  ] = useQueryParam("s", StringParam);

  // Debounce the original search async function
  const debouncedSearch = useConstant(() => debounce(fetchConcepts, 500));

  const searchRequest = useAsync(async () => {
    if (host && branch && query) {
      return debouncedSearch(host, branch, query || "");
    }
    return ({} as any) as Readonly<IConceptResult>;
  }, [query, branch, intendedSite, form, rel, adm]); // Ensure a new request is made everytime the text changes (even if it's debounced)

  // Return everything needed for the hook consumer
  return {
    host,
    branch,
    query,
    form,
    rel,
    adm,
    intendedSite,
    searchRequest,
    conceptIdSubstance,
    setConceptIdSubstance,
    setBranch,
    setHost,
    setQuery,
    setIntendedSite,
    setForm,
    setAdm,
    setRel,
  };
};

const Search = ({ scope }: SearchProps) => {
  const {
    host,
    branch,
    setBranch,
    setHost,
    intendedSite,
    setIntendedSite,
    conceptIdSubstance,
    setConceptIdSubstance,
    rel,
    setRel,
    adm,
    setAdm,
    form,
    setForm,
    searchRequest,
  } = useSearch();

  const branchRequest = useAsync(fetchBranches, [host || hosts[0]]);

  useEffect(() => {
    if (branchRequest.result && !branch) {
      const { path } =
        branchRequest.result.find((b) => b.path === defaultBranch) || {};
      if (path) {
        setBranch(path);
      }
    }
  }, [branch, branchRequest, setBranch]);

  const intededSiteRequest = useAsync(fetchIntendedSites, [
    host || hosts[0],
    branch || defaultBranch,
    conceptIdSubstance,
  ]);

  useEffect(() => {
    if (intededSiteRequest.result && !intendedSite) {
      const { conceptId } =
        intededSiteRequest.result.items.find((is) => is.conceptId === "666") ||
        {};
      if (conceptId) {
        setIntendedSite(conceptId);
      }
    }
  }, [intendedSite, intededSiteRequest, setIntendedSite]);

  const adminRequest = useAsync(fetchAdms, [
    host || hosts[0],
    branch || defaultBranch,
    conceptIdSubstance,
  ]);

  useEffect(() => {
    if (adminRequest.result && !adm) {
      const { conceptId } =
        adminRequest.result.items.find((a) => a.conceptId === "666") || {};
      if (conceptId) {
        setAdm(conceptId);
      }
    }
  }, [adm, adminRequest, setAdm]);
  console.log(adm);

  const relRequest = useAsync(fetchReleases, [
    host || hosts[0],
    branch || defaultBranch,
    conceptIdSubstance,
  ]);

  useEffect(() => {
    if (relRequest.result && !rel) {
      const { conceptId } =
        relRequest.result.items.find((r) => r.conceptId === "666") || {};
      if (conceptId) {
        setRel(conceptId);
      }
    }
  }, [rel, relRequest, setRel]);

  const formRequest = useAsync(fetchForms, [
    host || hosts[0],
    branch || defaultBranch,
  ]);

  useEffect(() => {
    if (formRequest.result && !form) {
      const { conceptId } =
        formRequest.result.items.find((f) => f.conceptId === "666") || {};
      if (conceptId) {
        setForm(conceptId);
      }
    }
  }, [form, formRequest, setForm]);

  useEffect(() => {
    if (!host) {
      setHost(hosts[0]);
    }
  }, [host, setHost]);

  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault();
  };

  const handleHostChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setHost(event.target.value);
  };
  const handleBranchChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setBranch(event.target.value);
  };

  const handleIntendedSiteChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setIntendedSite(event.target.value);
  };

  const handleFormChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setForm(event.target.value);
  };

  const handleAdmChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setAdm(event.target.value);
  };

  const handleSubstanceChange = (conceptId: string) => {
    setConceptIdSubstance(conceptId);
  };

  const handleRelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRel(event.target.value);
  };

  let doseFormModificator: string;
  if (form === "739006009") {
    doseFormModificator = "736853009";
  } else {
    doseFormModificator = "*";
  }
  let doseFormModificator2 = form;
  if (form === "739006009") {
    doseFormModificator2 = "739005008";
  } else {
    doseFormModificator2 = form;
  }
  const branches = branchRequest.result || [];
  const { items = [] } = searchRequest.result || {};
  const fetchGenericUrl =
    (host || hosts[0]) +
    "/" +
    (branch || defaultBranch) +
    "/concepts?ecl=<<763158003:762949000=(" +
    conceptIdSubstance +
    " OR (<<105590001:738774007=" +
    conceptIdSubstance +
    ")),411116001=((<<736542009:736475003=" +
    rel +
    ",736472000=" +
    adm +
    ",736474004=" +
    intendedSite +
    ",736476002=" +
    form +
    ") OR (<<736542009:736475003=" +
    rel +
    ",736472000=" +
    adm +
    ",736474004=" +
    intendedSite +
    ",736476002=" +
    doseFormModificator2 +
    ",736473005= " +
    doseFormModificator +
    "))";
  const fetchCommercial =
    (host || hosts[0]) +
    "/browser/" +
    "MAIN%2FSNOMEDCT-NO%2FREFSETS/members?referenceSet=6021000202106&referencedComponentId=";

  return (
    <div className="container">
      <Header scope={scope} />
      <div className="row mb-5">
        <div className="col-9 col-md-10">
          {branchRequest.error && <Error>{branchRequest.error.message}</Error>}
          {!branchRequest.loading && !branchRequest.error && (
            <form onSubmit={handleFormSubmit}>
              <div className="form-row">
                {!scope && (
                  <>
                    <div className="col-12">
                      <div className="form-group">
                        <label htmlFor="host">Host</label>
                        <select
                          id="host"
                          className="form-control"
                          value={host}
                          onChange={handleHostChange}
                        >
                          {hosts.map((hostname) => (
                            <option value={hostname} key={hostname}>
                              {hostname}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="form-group">
                        <label htmlFor="branch">Branch</label>
                        <select
                          id="branch"
                          className="form-control"
                          onChange={handleBranchChange}
                        >
                          {branches.map(({ path }) => (
                            <option value={path} key={path}>
                              {path}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="col-md-12">
                  <div className="form-group">
                    <label htmlFor="query">Substans</label>
                    <DrugAutoSuggest
                      host={host}
                      branch={branch}
                      suggestCallback={setConceptIdSubstance}
                      onChange={handleSubstanceChange}
                      autoComplete="off"
                    />
                    <section aria-labelledby="results">
                      <ul className="list-group">
                        {items.map(
                          ({
                            concept: {
                              conceptId,
                              fsn: { term: fullySpecifiedName },
                              pt: { term: preferredTerm },
                            },
                          }) => (
                            <li
                              key={conceptId}
                              className="list-group-item mb-2"
                            >
                              <Concept
                                host={host || hosts[0]}
                                branch={branch || ""}
                                preferredTerm={preferredTerm}
                                fullySpecifiedName={fullySpecifiedName}
                                conceptId={conceptId}
                                scope={scope}
                              />
                            </li>
                          ),
                        )}
                      </ul>
                    </section>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="Frigivelse">Frigivelse:</label>
                      <select
                        defaultValue=""
                        id="rel"
                        className="form-control"
                        onChange={handleRelChange}
                      >
                        <option value="" disabled>
                          Velg
                        </option>
                        {relRequest.result &&
                          relRequest.result.items.map(({ pt, conceptId }) => (
                            <option value={conceptId} key={pt.term}>
                              {pt.term}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="admMetode">Adm. metode</label>
                      <select
                        defaultValue=""
                        id="adm"
                        className="form-control"
                        onChange={handleAdmChange}
                      >
                        <option value="" disabled>
                          Velg
                        </option>
                        {adminRequest.result &&
                          adminRequest.result.items.map(({ pt, conceptId }) => (
                            <option value={conceptId} key={pt.term}>
                              {pt.term}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="intendedSite">Intended site</label>
                      <select
                        defaultValue=""
                        id="conceptIdSite"
                        className="form-control"
                        onChange={handleIntendedSiteChange}
                      >
                        <option value="" disabled>
                          Velg
                        </option>
                        {intededSiteRequest.result &&
                          intededSiteRequest.result.items.map(
                            ({ pt, conceptId }) => (
                              <option value={conceptId} key={pt.term}>
                                {pt.term}
                              </option>
                            ),
                          )}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="form">Form</label>

                      <select
                        defaultValue=""
                        id="form"
                        className="form-control"
                        onChange={handleFormChange}
                      >
                        <option value="" disabled>
                          Velg
                        </option>
                        {formRequest.result &&
                          formRequest.result.items.map(({ pt, conceptId }) => (
                            <option value={conceptId} key={pt.term}>
                              {pt.term}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              {/*<input type="submit" value="Søk etter legemiddel" />*/}
              <DrugListComponent
                isDisabled={!rel || !intendedSite || !adm || !form}
                genericUrl={fetchGenericUrl}
                commercialUrl={fetchCommercial}
              />
            </form>
          )}
        </div>
        <div className="col-3 col-md-2">
          <div className="d-flex h-100 align-items-center justify-content-center">
            {searchRequest.loading && <Loading />}
          </div>
        </div>
        <div className="row">
          <div className="col-3 col-md-8">
            {searchRequest.error && (
              <Error>{searchRequest.error.message}</Error>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
