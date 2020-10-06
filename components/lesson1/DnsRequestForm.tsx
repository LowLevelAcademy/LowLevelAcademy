// Form to send a DNS request in the virtual network.

import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createPlaygroundAction,
  performExecute,
} from "../../playground/actions";
import { applyDnsRequest } from "../../playground/lesson1/actions";
import { wrapFullDemoCode } from "../../playground/lesson1/rust";
import { selectCompileResults } from "../../playground/selectors";

const getElemPosition = (element) => {
  let top = 0;
  do {
    top += element.offsetTop || 0;
    element = element.offsetParent;
  } while (element);
  return top;
};

const scrollToElem = (elem) => {
  console.log(elem, getElemPosition(elem));
  window.scrollTo({ top: getElemPosition(elem), behavior: "smooth" });
};

const DnsRequestForm: React.FC = () => {
  const dispatch = useDispatch();
  const resolvedIp = useSelector(
    (state: any) => selectCompileResults(state, "fullDemo")?.resolvedIp
  );
  const [domainName, setDomainName] = useState("Alice");
  console.log("Resolved IP: ", resolvedIp);

  const submitDnsReq = useCallback(
    (event) => {
      event.preventDefault();

      dispatch(createPlaygroundAction("fullDemo", applyDnsRequest(domainName)));

      scrollToElem(document.getElementById("lesson1-dns-form"));

      setTimeout(() => {
        dispatch(performExecute("fullDemo", wrapFullDemoCode));
      }, 200);

      return false;
    },
    [domainName]
  );

  return (
    <form className="form-inline" onSubmit={submitDnsReq}>
      <div className="form-group mr-3">
        <label htmlFor="domain_name_input" className="sr-only">
          Domain name
        </label>
        <input
          type="text"
          className="form-control"
          id="domain_name_input"
          placeholder="example.org"
          value={domainName}
          onChange={(ev) => setDomainName(ev.target.value)}
        />
      </div>
      <button className="btn btn-green">Resolve</button>
      <div className="form-group ml-3">
        {resolvedIp === "0.0.0.0" ? <em>Domain not found</em> : resolvedIp}
      </div>
    </form>
  );
};

export default DnsRequestForm;
