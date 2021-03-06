'use strict';
require('../bootstrap');
import Hoist from '../../src';
import sinon from 'sinon';
import {expect} from 'chai';
import BBPromise from 'bluebird';
import DataPipeline from '@hoist/data-pipeline';

/** @test {DataAPI} */
describe('Hoist.data', function () {
  before(function () {

  });
  var objToSave = {
    key: 'value'
  };
  /** @test {DataAPI#save} */
  describe('Hoist.data.#save', function () {
    before(function () {
      sinon.stub(DataPipeline.prototype, 'save').returns(BBPromise.resolve(true));
    });
    after(function () {
      DataPipeline.prototype.save.restore();
    });
    describe('with type set by class', function () {
      var data;
      before(function () {
        data = Hoist.data('person');
        data.save(objToSave);
      });
      after(function () {
        DataPipeline.prototype.save.reset();
      });

      it('passes to pipeline save', function () {
        expect(DataPipeline.prototype.save)
          .to.have.been.calledWith('person', objToSave);
      });
    });
    describe('with type set by object', function () {
      var data;
      before(function () {
        data = Hoist.data();
        objToSave._type = 'person';
        data.save(objToSave);
      });
      after(function () {
        objToSave._type = null;
        DataPipeline.prototype.save.reset();
      });

      it('passes to pipeline save', function () {
        expect(DataPipeline.prototype.save)
          .to.have.been.calledWith('person', objToSave);
      });
    });
  });
});
