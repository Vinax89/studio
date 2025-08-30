import React from 'react';

const handler: ProxyHandler<any> = {
  get: (_target, prop) => {
    if (prop === '__esModule') {
      return true;
    }
    return (props: any) => React.createElement('svg', props);
  },
};

export = new Proxy({}, handler);
