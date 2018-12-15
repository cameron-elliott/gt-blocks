/**
 * External dependencies
 */
const { find } = window.lodash;

/**
 * WordPress dependencies
 */
const { __ } = wp.i18n;
const { compose } = wp.compose;
const { withDispatch } = wp.data;
const TokenList = wp.tokenList;

const {
	Component,
	Fragment,
} = wp.element;

const { InspectorControls } = wp.editor;

const {
	PanelBody,
	SelectControl,
} = wp.components;

/**
 * Internal dependencies
 */
import { default as GridEdit } from '../../components/grid-container/edit';

// Define blocks for each column.
const TEMPLATE = [
	[ 'gt-blocks/image', {
		synchronizeStyling: true,
		parentBlock: 'gt-blocks/portfolio',
	} ],
	[ 'gt-blocks/heading', {
		placeholder: __( 'Project', 'gt-blocks' ),
		synchronizeStyling: true,
		parentBlock: 'gt-blocks/portfolio',
	} ],
	[ 'core/paragraph', {
		placeholder: __( 'Write project description...', 'gt-blocks' ),
		synchronizeStyling: true,
		parentBlock: 'gt-blocks/portfolio',
	} ],
];

/**
 * Block Edit Component
 */
class PortfolioEdit extends Component {
	getActiveStyle( styles, className ) {
		for ( const style of new TokenList( className ).values() ) {
			if ( style.indexOf( 'is-style-' ) === -1 ) {
				continue;
			}

			const potentialStyleName = style.substring( 9 );
			const activeStyle = find( styles, { value: potentialStyleName } );
			if ( activeStyle ) {
				return activeStyle;
			}
		}

		return find( styles, 'isDefault' );
	}

	replaceActiveStyle( className, activeStyle, newStyle ) {
		const list = new TokenList( className );

		if ( activeStyle ) {
			list.remove( 'is-style-' + activeStyle.value );
		}

		list.add( 'is-style-' + newStyle );

		return list.value;
	}

	render() {
		const {
			attributes,
			onChangeClassName,
		} = this.props;

		const blockStyles = [
			{ value: 'default', label: __( 'Default', 'gt-blocks' ), isDefault: true },
			{ value: 'card', label: __( 'Card', 'gt-blocks' ) },
		];

		const activeStyle = this.getActiveStyle( blockStyles, attributes.className );

		const updateClassName = ( newStyle ) => {
			const updatedClassName = this.replaceActiveStyle( attributes.className, activeStyle, newStyle );
			onChangeClassName( updatedClassName );
		};

		return (
			<Fragment>

				<InspectorControls>

					<PanelBody title={ __( 'Styles', 'gt-blocks' ) } initialOpen={ false } className="gt-panel-styles gt-panel">

						<SelectControl
							label={ __( 'Styles', 'gt-blocks' ) }
							value={ activeStyle.value }
							onChange={ ( newStyle ) => updateClassName( newStyle ) }
							options={ blockStyles }
						/>

					</PanelBody>

				</InspectorControls>

				<GridEdit
					template={ TEMPLATE }
					parentBlock={ this.props.name }
					{ ...this.props }
				/>

			</Fragment>
		);
	}
}

export default compose( [
	withDispatch( ( dispatch, { clientId } ) => {
		return {
			onChangeClassName( newClassName ) {
				dispatch( 'core/editor' ).updateBlockAttributes( clientId, {
					className: newClassName,
				} );
			},
		};
	} ),
] )( PortfolioEdit );
