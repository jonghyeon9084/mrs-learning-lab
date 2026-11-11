// Pure transformation. Storage is changed only after the user confirms in the UI.
export function resetRecords(records,{progress=true,notes=false,checks=false,code=false,translation=false}={}){
  return {...structuredClone(records),
    ...(progress?{completed:[],quiz:{},solved:[]}:{}),
    ...(notes?{notes:''}:{}),...(checks?{checks:[]}:{}),...(code?{drafts:{}}:{}),...(translation?{translationDrafts:{}}:{})};
}
