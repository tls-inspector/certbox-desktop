import { CertificateRequest } from "../../shared/types";

export class Validator {
    public static CertificateRequest(request: CertificateRequest): string {
        let notBefore: number;
        try {
            notBefore = Date.parse(request.Validity.NotBefore);
        } catch (err) {
            return "Not Before date is invalid";
        }

        let notAfter: number;
        try {
            notAfter = Date.parse(request.Validity.NotAfter);
        } catch (err) {
            return "Not After date is invalid";
        }

        if (notBefore > notAfter) {
            return "Not Before date cannot be after the Not After date"
        }

        if (!request.Subject.Organization || request.Subject.Organization === '') {
            return "Organization Name is required";
        }

        if (!request.Subject.City || request.Subject.City === '') {
            return "City or Locale Name is required";
        }

        if (!request.Subject.Province || request.Subject.Province === '') {
            return "Province or State Name is required";
        }

        if (!request.Subject.Country || request.Subject.Country === '') {
            return "Country Name is required";
        }

        if (!request.Subject.CommonName || request.Subject.CommonName === '') {
            return "Common Name is required";
        }

        for (let i = 0; i < request.AlternateNames.length; i++) {
            const alternameName = request.AlternateNames[i];
            if (!alternameName.Value || alternameName.Value === '') {
                return "Alternate Name must have a value"
            }
        }

        return undefined;
    }
}
