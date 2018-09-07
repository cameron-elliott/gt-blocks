/**
 * External dependencies
 */
import classnames from 'classnames';
import { range } from 'lodash';
const { getComputedStyle } = window;

/**
 * WordPress dependencies
 */
const {
	Component,
	Fragment,
} = wp.element;

const {
	__,
	sprintf,
} = wp.i18n;

const { withSelect } = wp.data;
const { compose } = wp.compose;

const {
	AlignmentToolbar,
	BlockAlignmentToolbar,
	BlockControls,
	ContrastChecker,
	InspectorControls,
	PanelColorSettings,
	RichText,
	withColors,
	withFontSizes,
} = wp.editor;

const {
	BaseControl,
	Button,
	Dashicon,
	FontSizePicker,
	IconButton,
	PanelBody,
	RangeControl,
	SelectControl,
	Toolbar,
	withFallbackStyles,
} = wp.components;

/**
 * Internal dependencies
 */
import { default as IconPicker } from '../../components/icon-picker';
import {
	gtIconNumberTwo,
	gtIconNumberThree,
	gtIconNumberFour,
} from '../../components/icons';

/* Set Fallback Styles */
const applyFallbackStyles = withFallbackStyles( ( node, ownProps ) => {
	const { textColor, backgroundColor, fontSize, customFontSize } = ownProps.attributes;
	const editableNode = node.querySelector( '[contenteditable="true"]' );
	//verify if editableNode is available, before using getComputedStyle.
	const computedStyles = editableNode ? getComputedStyle( editableNode ) : null;
	return {
		fallbackBackgroundColor: backgroundColor || ! computedStyles ? undefined : computedStyles.backgroundColor,
		fallbackTextColor: textColor || ! computedStyles ? undefined : computedStyles.color,
		fallbackFontSize: fontSize || customFontSize || ! computedStyles ? undefined : parseInt( computedStyles.fontSize ) || undefined,
	};
} );

/**
 * Block Edit Component
 */
class gtFeaturesEdit extends Component {
	constructor() {
		super( ...arguments );

		this.addFeaturesItem = this.addFeaturesItem.bind( this );
		this.onChangeIcon = this.onChangeIcon.bind( this );
		this.onChangeTitle = this.onChangeTitle.bind( this );
		this.onChangeText = this.onChangeText.bind( this );

		this.state = {
			currentIndex: 0,
		};
	}

	addFeaturesItem() {
		const newItems = [ ...this.props.attributes.items ];
		newItems.push( {} );
		this.props.setAttributes( { items: newItems } );
	}

	moveUpFeaturesItem( index ) {
		// Return early if item is already on top.
		if ( index === 0 ) {
			return false;
		}

		// Swap Items.
		const newItems = [ ...this.props.attributes.items ];
		[ newItems[ index - 1 ], newItems[ index ] ] = [ newItems[ index ], newItems[ index - 1 ] ];
		this.props.setAttributes( { items: newItems } );
	}

	moveDownFeaturesItem( index ) {
		const newItems = [ ...this.props.attributes.items ];

		// Return early if item is already on top.
		if ( ( index + 1 ) === newItems.length ) {
			return false;
		}

		// Swap Items.
		[ newItems[ index ], newItems[ index + 1 ] ] = [ newItems[ index + 1 ], newItems[ index ] ];
		this.props.setAttributes( { items: newItems } );
	}

	duplicateFeaturesItem( index ) {
		const newItems = [ ...this.props.attributes.items ];

		// Duplicate Item.
		newItems.splice( index + 1, 0, { ...newItems[ index ] } );
		this.props.setAttributes( { items: newItems } );
	}

	removeFeaturesItem( index ) {
		const newItems = [ ...this.props.attributes.items ].filter( ( value, key ) => key !== index );
		this.props.setAttributes( { items: newItems } );
	}

	onChangeIcon( newIcon, index ) {
		const newItems = [ ...this.props.attributes.items ];
		if ( newItems[ index ] !== undefined ) {
			newItems[ index ].icon = newIcon;
		}
		this.props.setAttributes( { items: newItems } );
	}

	onChangeTitle( newTitle, index ) {
		const newItems = [ ...this.props.attributes.items ];
		if ( newItems[ index ] !== undefined ) {
			newItems[ index ].title = newTitle;
		}
		this.props.setAttributes( { items: newItems } );
	}

	onChangeText( newText, index ) {
		const newItems = [ ...this.props.attributes.items ];
		if ( newItems[ index ] !== undefined ) {
			newItems[ index ].text = newText;
		}
		this.props.setAttributes( { items: newItems } );
	}

	render() {
		const {
			attributes,
			iconColor,
			setIconColor,
			iconBackgroundColor,
			setIconBackgroundColor,
			backgroundColor,
			setBackgroundColor,
			fallbackBackgroundColor,
			textColor,
			setTextColor,
			fallbackTextColor,
			fontSize,
			setFontSize,
			fallbackFontSize,
			fontSizes,
			setAttributes,
			isSelected,
			className,
			wideControlsEnabled,
		} = this.props;

		const {
			items,
			blockAlignment,
			textAlignment,
			columns,
			iconLayout,
			iconSize,
			iconPadding,
			outlineBorderWidth,
			titleTag,
		} = attributes;

		const gridClasses = classnames( 'gt-grid-container', {
			[ `gt-columns-${ columns }` ]: columns,
		} );

		const itemClasses = classnames( 'gt-grid-item', {
			'has-text-color': textColor.color,
			[ textColor.class ]: textColor.class,
			'has-background': backgroundColor.color,
			[ backgroundColor.class ]: backgroundColor.class,
		} );

		const itemStyles = {
			textAlign: textAlignment,
			color: textColor.class ? undefined : textColor.color,
			backgroundColor: backgroundColor.class ? undefined : backgroundColor.color,
		};

		const iconClasses = classnames( 'gt-icon', {
			[ `gt-icon-${ iconLayout }` ]: ( iconLayout !== 'default' ),
			'has-icon-color': iconColor.color,
			[ iconColor.class ]: iconColor.class,
			'has-icon-background': iconBackgroundColor.color,
			[ iconBackgroundColor.class ]: iconBackgroundColor.class,
		} );

		const iconStyles = {
			color: iconColor.class ? undefined : iconColor.color,
			backgroundColor: iconBackgroundColor.class ? undefined : iconBackgroundColor.color,
		};

		const paddingStyles = iconLayout === 'default' ? {} : {
			paddingTop: iconPadding !== 32 ? iconPadding + 'px' : undefined,
			paddingBottom: iconPadding !== 32 ? iconPadding + 'px' : undefined,
			paddingLeft: ( iconLayout !== 'full' && iconPadding !== 32 ) ? iconPadding + 'px' : undefined,
			paddingRight: ( iconLayout !== 'full' && iconPadding !== 32 ) ? iconPadding + 'px' : undefined,
			borderWidth: ( iconLayout === 'outline' && outlineBorderWidth !== 3 ) ? outlineBorderWidth + 'px' : undefined,
		};

		const textClasses = classnames( 'gt-text', {
			[ fontSize.class ]: fontSize.class,
		} );

		const textStyles = {
			fontSize: fontSize.size ? fontSize.size + 'px' : undefined,
		};

		const columnIcons = {
			2: gtIconNumberTwo,
			3: gtIconNumberThree,
			4: gtIconNumberFour,
		};

		return (
			<Fragment>

				<BlockControls key="controls">

					<BlockAlignmentToolbar
						value={ blockAlignment }
						onChange={ ( newAlign ) => setAttributes( { blockAlignment: newAlign ? newAlign : blockAlignment } ) }
						controls={ [ 'center', 'wide', 'full' ] }
					/>

					<Toolbar
						controls={
							[ 2, 3, 4 ].map( column => ( {
								icon: columnIcons[ column ],
								title: sprintf( __( '%s Columns' ), column ),
								isActive: column === columns,
								onClick: () => setAttributes( { columns: column } ),
							} ) )
						}
					/>

					<AlignmentToolbar
						value={ textAlignment }
						onChange={ ( newAlignment ) => setAttributes( { textAlignment: newAlignment } ) }
					/>

				</BlockControls>

				<InspectorControls key="inspector">

					<PanelBody title={ __( 'Layout Settings' ) } initialOpen={ false } className="gt-panel-layout-settings gt-panel">

						<RangeControl
							label={ __( 'Columns' ) }
							value={ columns }
							onChange={ ( nextColumns ) => setAttributes( { columns: nextColumns } ) }
							min={ 2 }
							max={ 6 }
						/>

						{ wideControlsEnabled && (
							<BaseControl id="gt-block-alignment" label={ __( 'Block Alignment' ) }>
								<BlockAlignmentToolbar
									value={ blockAlignment }
									onChange={ ( newAlign ) => setAttributes( { blockAlignment: newAlign ? newAlign : blockAlignment } ) }
									controls={ [ 'center', 'wide', 'full' ] }
								/>
							</BaseControl>
						) }

					</PanelBody>

					<PanelBody title={ __( 'Icon Settings' ) } initialOpen={ false } className="gt-panel-icon-settings gt-panel">

						<SelectControl
							label={ __( 'Icon Style' ) }
							value={ iconLayout }
							onChange={ ( newStyle ) => setAttributes( { iconLayout: newStyle } ) }
							options={ [
								{ value: 'default', label: __( 'Default' ) },
								{ value: 'circle', label: __( 'Circle' ) },
								{ value: 'outline', label: __( 'Outline' ) },
								{ value: 'square', label: __( 'Square' ) },
								{ value: 'full', label: __( 'Full' ) },
							] }
						/>

						<RangeControl
							label={ __( 'Icon Size' ) }
							value={ iconSize }
							onChange={ ( newSize ) => setAttributes( { iconSize: newSize } ) }
							min={ 16 }
							max={ 128 }
						/>

						{ iconLayout !== 'default' && (
							<RangeControl
								label={ __( 'Icon Padding' ) }
								value={ iconPadding }
								onChange={ ( newPadding ) => setAttributes( { iconPadding: newPadding } ) }
								min={ 16 }
								max={ 64 }
							/>
						) }

						{ iconLayout === 'outline' && (
							<RangeControl
								label={ __( 'Border Width' ) }
								value={ outlineBorderWidth }
								onChange={ ( newWidth ) => setAttributes( { outlineBorderWidth: newWidth } ) }
								min={ 1 }
								max={ 12 }
							/>
						) }

					</PanelBody>

					<PanelBody title={ __( 'Text Settings' ) } initialOpen={ false } className="gt-panel-text-settings gt-panel">

						<BaseControl id="gt-title-tag" label={ __( 'Heading' ) }>
							<Toolbar
								controls={
									range( 1, 7 ).map( ( level ) => ( {
										icon: 'heading',
										title: sprintf( __( 'Heading %s' ), level ),
										isActive: level === titleTag,
										onClick: () => setAttributes( { titleTag: level } ),
										subscript: level,
									} ) )
								}
							/>
						</BaseControl>

						<BaseControl id="gt-font-size" label={ __( 'Font Size' ) }>
							<FontSizePicker
								fontSizes={ fontSizes }
								fallbackFontSize={ fallbackFontSize }
								value={ fontSize.size }
								onChange={ setFontSize }
							/>
						</BaseControl>

					</PanelBody>

					<PanelColorSettings
						title={ __( 'Color Settings' ) }
						initialOpen={ false }
						colorSettings={ [
							{
								value: backgroundColor.color,
								onChange: setBackgroundColor,
								label: __( 'Background Color' ),
							},
							{
								value: textColor.color,
								onChange: setTextColor,
								label: __( 'Text Color' ),
							},
						] }
					>
						<ContrastChecker
							{ ...{
								textColor: textColor.color,
								backgroundColor: backgroundColor.color,
								fallbackTextColor,
								fallbackBackgroundColor,
							} }
							fontSize={ fontSize.size }
						/>
					</PanelColorSettings>

					<PanelColorSettings
						title={ __( 'Icon Color' ) }
						initialOpen={ false }
						colorSettings={ [
							{
								value: iconBackgroundColor.color,
								onChange: setIconBackgroundColor,
								label: __( 'Background Color' ),
							},
							{
								value: iconColor.color,
								onChange: setIconColor,
								label: __( 'Icon Color' ),
							},
						] }
					>
					</PanelColorSettings>

				</InspectorControls>

				<div className={ className }>
					<div className={ gridClasses }>

						{
							items.map( ( item, index ) => {
								return (
									<div className="gt-grid-column" key={ index }>

										<div className={ itemClasses } style={ itemStyles }>
											<div className="gt-icon-wrap">
												<IconPicker
													icon={ item.icon }
													iconClasses={ iconClasses }
													iconStyles={ iconStyles }
													iconSize={ iconSize }
													paddingStyles={ paddingStyles }
													isSelected={ isSelected }
													onChange={ ( newIcon ) => this.onChangeIcon( newIcon, index ) }
												/>
											</div>

											<div className="gt-content">

												<RichText
													tagName={ 'h' + titleTag }
													placeholder={ __( 'Enter a title' ) }
													value={ item.title }
													className="gt-title"
													onChange={ ( newTitle ) => this.onChangeTitle( newTitle, index ) }
													formattingControls={ [ 'bold', 'italic', 'strikethrough' ] }
													keepPlaceholderOnFocus
												/>

												<RichText
													tagName="div"
													multiline="p"
													placeholder={ __( 'Enter your text here.' ) }
													value={ item.text }
													className={ textClasses }
													style={ textStyles }
													onChange={ ( newText ) => this.onChangeText( newText, index ) }
													keepPlaceholderOnFocus
												/>

											</div>
										</div>

										{ isSelected && (
											<div className="gt-grid-item-controls">
												<IconButton
													className="move-up-features-item"
													label={ __( 'Move up' ) }
													icon="arrow-up-alt2"
													onClick={ () => this.moveUpFeaturesItem( index ) }
													disabled={ index === 0 }
												/>

												<IconButton
													className="move-down-features-item"
													label={ __( 'Move down' ) }
													icon="arrow-down-alt2"
													onClick={ () => this.moveDownFeaturesItem( index ) }
													disabled={ ( index + 1 ) === items.length }
												/>

												<IconButton
													className="duplicate-features-item"
													label={ __( 'Duplicate' ) }
													icon="admin-page"
													onClick={ () => this.duplicateFeaturesItem( index ) }
												/>

												<IconButton
													className="remove-features-item"
													label={ __( 'Remove' ) }
													icon="trash"
													onClick={ () => this.removeFeaturesItem( index ) }
												/>
											</div>
										) }

									</div>
								);
							} )
						}

					</div>

					{ isSelected && (
						<Button
							isLarge
							onClick={ this.addFeaturesItem }
							className="gt-add-features-item"
						>
							<Dashicon icon="insert" />
							{ __( 'Add features item' ) }
						</Button>
					) }
				</div>
			</Fragment>
		);
	}
}

export default compose( [
	withColors( 'backgroundColor', { textColor: 'color' }, { iconColor: 'color' }, { iconBackgroundColor: 'background-color' } ),
	withFontSizes( 'fontSize' ),
	applyFallbackStyles,
	withSelect(
		( select ) => {
			const { fontSizes } = select( 'core/editor' ).getEditorSettings();
			return { fontSizes };
		}
	),
] )( gtFeaturesEdit );
