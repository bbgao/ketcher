import { h, Component, render } from 'preact';
/** @jsx h */

import { sgroup as sgroupSchema } from '../structschema';
import { Form, Field, mapOf } from '../component/form';
import Dialog from '../component/dialog';

const schemes = mapOf(sgroupSchema, 'type');

function SelectOneOf(props, { stateStore }) {
	let {name, onChange, ...prop} = props;
	let selectDesc = {
		title: 'Type',
		enum: [],
		enumNames: []
	};

	Object.keys(schemes).forEach((item) => {
		selectDesc.enum.push(item);
		selectDesc.enumNames.push(schemes[item].title);
	});

	const changeSchema = type => {
		onChange(type);
		stateStore.changeSchema(schemes[type]);
	};

	return <Field schema={selectDesc}
				  {...stateStore.field(name, changeSchema)} {...prop}/>;
}

class Sgroup extends Component {
	constructor(props) {
		super(props);
		this.state = { type: props.type }
	}

	content = (type) => Object.keys(schemes[type].properties).map(prop =>
		 prop !== 'type' ? <Field name={prop} key={`${type}-${prop}`} /> : null
 	);

	render(props) {
		const { type } = this.state;
		const desc = schemes[type];
		return (
			<Form component={Dialog} title="S-Group Properties" className="sgroup"
				  schema={desc} init={props} params={props}>
				<SelectOneOf name="type" onChange={(type) => this.setState({type: type})}/>
				<fieldset class={type === 'DAT' ? 'data' : 'base'}>
					{ this.content(type) }
				</fieldset>
			</Form>
		);
	}
}

export default function dialog(params) {
	const overlay = $$('.overlay')[0];
	return render((
		<Sgroup {...params}/>
	), overlay);
};
