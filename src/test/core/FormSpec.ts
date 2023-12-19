import {Form} from "../../main/core/Form";
import {deepStrictEqual} from "assert";
import {strictEqual} from "node:assert";

describe('form', () => {

    it('gets form field', () => {
        strictEqual(Form.of({name: 'tom'}).field('name'), 'tom');
    });

    it('adds a form field', () => {
        deepStrictEqual(Form.of({name: 'tom'}).withFormField('age', '27').asObject(), {name: 'tom', age: '27'})
    });

    it('gives you form as object', () => {
        deepStrictEqual(
            Form.of({name: 'tom'}).withFormField('age', '27').withFormField('age', '28').asObject(),
            {name: 'tom', age: ['27', '28']}
        )
    });

    it('accumulates fields of same name', () => {
        deepStrictEqual(Form.of({name: 'tom'})
            .withFormField('age', '27')
            .withFormField('age', '28')
            .asObject(),
        {name: 'tom', age: ['27', '28']})
    });

    it('merges forms', () => {
        deepStrictEqual(Form.of({name: 'tom'})
            .withForm({name: 'ben', age: '31'})
            .withForm({name: 'losh', age: '33'}).asObject(),
            {name: ['tom', 'ben', 'losh'], age: ['31', '33']}
        );
    });

    it('gives form body string', () => {
        strictEqual(
            Form.of({name: 'tom'}).withFormField('age', '27').withFormField('age', '28').formBodyString(),
            'name=tom&age=27&age=28'
        )
    });

    it('create from a form body string', () => {
        deepStrictEqual(
            Form.fromBodyString('name=tom&age=27&age=28'),
            Form.of({name: 'tom'}).withFormField('age', '27').withFormField('age', '28')
        )
    });

    it('decodes form parameters from body string', () => {
        deepStrictEqual(
          Form.fromBodyString('url=http%3A%2F%2Fwww.google.com'),
          Form.of({url: 'http://www.google.com'})
        )
    });

    it('preserves spaces', () => {
        deepStrictEqual(
          Form.fromBodyString('font=Cormorant+Garamond'),
          Form.of({font: 'Cormorant Garamond'})
        )
    })

});
