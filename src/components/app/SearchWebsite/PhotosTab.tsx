import { ImageAbout } from 'utils/Constant';
import { Row } from 'reactstrap';
import PagesSort from './Pages';
// Eliminamos la importación del componente que no existe

const PhotosTab = () => {
  return (
    <>
      <div>
        <h6 className='mb-2 col-sm-12 digits'>{ImageAbout}</h6>
        <Row className='my-gallery gallery-with-description'>
          {/* Reemplazamos el componente que no existe con un mensaje o placeholder */}
          <div className='col-12'>
            <p>Galería de imágenes</p>
          </div>
        </Row>
      </div>
      <PagesSort />
    </>
  );
};

export default PhotosTab;
