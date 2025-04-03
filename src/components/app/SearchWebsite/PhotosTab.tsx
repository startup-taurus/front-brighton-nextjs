import { ImageAbout } from 'utils/Constant';
import { Row } from 'reactstrap';
import PagesSort from './Pages';

const PhotosTab = () => {
  return (
    <>
      <div>
        <h6 className='mb-2 col-sm-12 digits'>{ImageAbout}</h6>
        <Row className='my-gallery gallery-with-description'></Row>
      </div>
      <PagesSort />
    </>
  );
};

export default PhotosTab;
