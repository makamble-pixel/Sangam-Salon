
    async function api(path, opts={}){
      const o = Object.assign({headers:{'Content-Type':'application/json'}}, opts);
      const res = await fetch(path, o);
      if(!res.ok){ throw await res.json().catch(()=>({error:res.statusText})); }
      return res.json();
    }
    