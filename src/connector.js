'use strict';
import errors from '@hoist/errors';
import Pipeline from '@hoist/connector-pipeline';
import BaseAPI from './base_api';
import {
  filter, functions
}
from 'lodash';
import logger from '@hoist/logger';
import Bluebird from 'bluebird';
/**
 * Hoists API wrapper around connectors
 */
class ConnectorAPI extends BaseAPI {
  /**
   * create a new connector API
   * @param {string} key - the connector key
   */
  constructor(key) {
    super();
    this._logger = logger.child({
      cls: this.constructor.name
    });
    if (!key) {
      throw new errors.connector.request.InvalidError();
    }
    this._pipeline = new Pipeline();
    this._key = key;
    this._loadConnector();
  }
  _loadConnector() {
    if (!this._connector) {
      this._connector = this._pipeline.loadConnector(this._key).then((c) => {

        let methods = filter(functions(c), (property) => {

          if (property.startsWith('_') || property === 'receiveBounce' || this[property]) {
            return false;
          } else {
            return true;
          }
        });
        //we should always show the rest params but they might return an error
        methods = methods.concat(['get', 'post', 'put', 'delete', 'authorize']);
        methods.forEach((method) => {
          /**
           * also has all methods of underlying connector
           */
          let _this = this;
          this[method] = function (...params) {
            _this._logger.info('proxying method ' + method);
            if (typeof c[method] !== 'function') {
              var methodType = typeof c[method];
              _this._logger.warn({
                methodType: methodType,
                typeof: c
              }, 'tried to call an unsupported method');
              throw new errors.connector.request.UnsupportedError(method + ' method unsupported');
            }
            let callback;
            if (typeof (params[params.length - 1]) === 'function') {
              callback = params.pop();
            }
            return Bluebird.resolve(c[method].apply(c, params))
              .nodeify(callback);
          };
        });
      });

    }
    return this._connector;
  }
  init() {
    return this._loadConnector();
  }
  get(...params) {
    return this._loadConnector()
      .then(() => {
        return this.get.apply(this, params);
      });
  }
  put(...params) {
    return this._loadConnector()
      .then(() => {
        return this.put.apply(this, params);
      });

  }
  post(...params) {
    return this._loadConnector()
      .then(() => {
        return this.post.apply(this, params);
      });
  }
  delete(...params) {
    return this._loadConnector()
      .then(() => {
        return this.delete.apply(this, params);
      });
  }
  authorize(...params) {
    return this._loadConnector()
      .then(() => {
        return this.authorize.apply(this, params);
      });
  }
}

export default ConnectorAPI;
