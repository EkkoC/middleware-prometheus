
## Install

``` bash
yarn add ekko-middleware-prometheus
# or
npm i --save ekko-middleware-prometheus
```

## Usage

### Options

| Name | Description | Default |
| :-: | :- | :- |
| metricsPath | Url route that will expose the metrics for scraping. | `/metrics` |
| metricsApp  | Express app that will expose metrics endpoint, if an app is provided, use it, instead of instantiating a new one | `null` |
| collectDefaultMetrics | Whether or not to collect `prom-client` default metrics. These metrics are usefull for collecting saturation metrics, for example. | `true` |
| collectGCMetrics | Whether or not to collect garbage collection metrics via module `prometheus-gc-stats`. Dependency `prometheus-gc-stats` is marked as optional, hence if this option is set to `true` but npm/yarn could not install the dependency, no garbage collection metric will be collected. | `false` |
| requestDurationBuckets | Buckets for the request duration metrics (in milliseconds) histogram | Uses `prom-client` utility: `Prometheus.exponentialBuckets(0.05, 1.75, 8)` |
| extraMasks | Optional, list of regexes to be used as argument to [url-value-parser](https://www.npmjs.com/package/url-value-parser), this will cause extra route params,  to be replaced with a `#val` placeholder.  | no extra masks: `[]` |
| authenticate | Optional authentication callback, the function should receive as argument, the `req` object and return truthy for sucessfull authentication, or falsy, otherwise. This option supports Promise results. | `null` |
| prefix | Optional prefix for the metrics name | no prefix added |
| customLabels | Optional Array containing extra labels, used together with  `transformLabels` | no extra labels: `[]` |
| transformLabels | Optional `function(labels, req, res)` adds to the labels object dynamic values for each label in `customLabels` | `null` |
### Example

```js
const express = require('express');
const promMid = require('ekko-express-prometheus');
const app = express();

const PORT = 9091;
app.use(promMid({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5],
}));

// curl -X GET localhost:9091/hello?name=Chuck%20Norris
app.get('/hello', (req, res) => {
  console.log('GET /hello');
  const { name = 'Anon' } = req.query;
  res.json({ message: `Hello, ${name}!` });
});

app.listen(PORT, () => {
  console.log(`Example api is listening on http://localhost:${PORT}`);
});
```

### Metrics exposed

- Default metrics from [prom-client](https://github.com/siimon/prom-client)
- `http_requests_total`: Counter for total requests received, has labels `route`, `method`, `status`
- `http_request_duration_seconds`: - Duration of HTTP requests in seconds, has labels `route`, `method`, `status`

The labels `route` and `status` are normalized:

- `route`: will normalize id like route params
- `status`: will normalize to Status Code , like `200` or `404`.

### Example prometheus queries

In the examples below, Suppose you tagged your application as "myapp", in the prometheus scrapping config.

#### Running instances

```js
sum(up{app="myapp"})
```

#### Overall error rate

Rate of http status code 5XX responses

```js
sum(rate(http_requests_total{status="5XX", app="myapp"}[5m]))
```

#### 95% of requests served within seconds

```js
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{app="myapp"}[5m])) by (le))
```

#### Average response time in seconds

```js
sum(rate(http_request_duration_seconds_sum{app="myapp"}[5m])) by (instance) / sum(rate(http_request_duration_seconds_count{app="myapp"}[5m])) by (instance)
```

#### Overall Request rate

```js
sum(rate(http_requests_total{app="myapp"}[5m])) by (instance)
```

#### Request rate by route

In this example we are removing some health/status-check routes, replace them with your needs.

```js
sum(rate(http_requests_total{app="myapp", route!~"/|/healthz"}[5m])) by (instance, route)
```

#### CPU usage

```js
rate(process_cpu_system_seconds_total{app="myapp"}[5m])
rate(process_cpu_user_seconds_total{app="myapp"}[5m])
```

#### Memory usage

```js
nodejs_heap_size_total_bytes{app="myapp"}
nodejs_heap_size_used_bytes{app="myapp"}
```
