import React, { FC, useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigate, useLocation } from 'react-router-dom';
import { apis } from '../apis';
import { PostEditDataProps, ImageType } from '../typings';
import { addressClear } from '../redux/features/addressSlice';
import { toggleClear, toggleModalShow } from '../redux/features/sortSlice';
import Modal from '../components/Modal';
import MapContainer from '../components/MapContainer';

const Newpost: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [images, setImages] = useState<string[]>([]);
  const [uploadImage, setUploadImage] = useState<File[]>([]);
  const [imgUrl, setImageUrl] = useState([]);
  const address = useSelector((state: RootState) => state.address);
  const modalShow = useSelector((state: RootState) => state.sort.modalShow);
  const { register, getValues } = useForm({});
  const data = location.state as PostEditDataProps;

  const onSaveFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files!;
    if (!files[0]) return;
    if (files.length + images.length > 3) {
      return alert('이미지는 세장까지 업로드 가능합니다.');
    }
    const readAndPreview = (file: File) => {
      const reader = new FileReader();
      reader.onload = () => setImages((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
      setUploadImage(Array.from(files) || []);
    };
    if (files) {
      [].forEach.call(files, readAndPreview);
    }
  };

  const handleDataUpload = async () => {
    const postData = {
      title: getValues().title,
      matchDeadline: getValues().matchDeadline,
      subject: getValues().subject,
      content: getValues().content,
      lat: address.lat,
      lng: address.lng,
      address: address.address,
    };
    const value = await apis.postUpload(postData);
    if (uploadImage.length > 0) {
      const formData = new FormData();
      for (let i = 0; i < uploadImage.length; i++) {
        formData.append('files', uploadImage[i]);
      }
      await apis.uploadImage(value, formData);
    }
    navigate('/search');
  };

  useEffect(() => {
    dispatch(toggleClear());
    if (data) {
      setImageUrl(data.imgurls);
    }
    return () => {
      dispatch(addressClear());
    };
  }, []);

  const handleEditUpload = async () => {
    const postData = {
      title: getValues().title,
      matchDeadline: getValues().matchDeadline,
      subject: getValues().subject,
      content: getValues().content,
      lat: address.lat,
      lng: address.lng,
      address: address.address,
    };
    await apis.updatePost(data.postId, postData);

    if (uploadImage.length > 0) {
      const formData = new FormData();
      for (let i = 0; i < uploadImage.length; i++) {
        if (uploadImage[i] !== null) {
          formData.append('files', uploadImage[i]);
        }
      }
      await apis.uploadImage(data.postId, formData);
    } else {
      navigate('/search');
    }
    navigate('/search');
  };

  const handledeletePrevImg = async (id: number) => {
    setImages(images.filter((_, index) => index !== id));
    setUploadImage([...uploadImage.slice(0, id), ...uploadImage.slice(id + 1)]);
  };

  const handledeleteImage = async (id: number) => {
    const imgpaths = data.imgpaths[id];
    if (imgpaths !== undefined) {
      await apis.deleteImage(imgpaths['path']);
    }
    if (data.imgurls.length > 0) {
      setImageUrl(imgUrl.filter((_, index) => index !== id));
    }
  };

  const handleToggleModal = useCallback(() => {
    dispatch(toggleModalShow());
  }, [modalShow]);

  const previewImage = () => {
    if (data) {
      return imgUrl.map((image: ImageType, id) => (
        <div key={id}>
          <img className='h-72 w-72' alt='' src={image['url']} />
          <button type='button' onClick={() => handledeleteImage(id)}>
            삭제
          </button>
        </div>
      ));
    } else {
      return images.map((image, id) => (
        <div key={id}>
          <img className='h-72 w-72' alt='' src={image} />
          <button type='button' onClick={() => handledeletePrevImg(id)}>
            삭제
          </button>
        </div>
      ));
    }
  };
  const editPreviewImage = () => {
    if (data) {
      return images.map((image, id) => (
        <div key={id}>
          <img className='h-72 w-72' alt='' src={image} />
          <button type='button' onClick={() => handledeletePrevImg(id)}>
            삭제
          </button>
        </div>
      ));
    }
  };

  return (
    <section className='flex flex-col justify-center bg-gray-200 w-full h-screen '>
      제목
      <input
        className='mb-3 w-full'
        type='text'
        defaultValue={data && data.title}
        {...register('title', { required: true })}
      />
      <section className='flex h-1/2 justify-center items-center gap-5'>
        {previewImage()}
        {editPreviewImage()}
      </section>
      <input type='file' multiple onChange={onSaveFiles} required />
      <section className='flex justify-center'>
        <div className='w-full'>
          모집마감일
          <input
            className='w-full'
            type='date'
            {...register('matchDeadline', { required: true })}
            defaultValue={data && data.matchDeadline}
          />
        </div>
      </section>
      종목
      <select
        className='w-full text-center'
        {...register('subject', { required: true })}
        defaultValue={data && data.subject}
      >
        <option value='ALL'>-종목을 골라주세요-</option>
        <option value='SOCCER'>축구</option>
        <option value='BASKETBALL'>농구</option>
        <option value='BADMINTON'>배드민턴</option>
        <option value='BILLIARDS'>당구</option>
        <option value='BOWLING'>볼링</option>
        <option value='TENNIS'>테니스</option>
        <option value='ETC'>기타</option>
      </select>
      <section>
        {modalShow && (
          <Modal onClickToggleModal={handleToggleModal}>
            <button className='ml-auto' onClick={handleToggleModal}>
              취소
            </button>
            <MapContainer />
          </Modal>
        )}
      </section>
      <section className='flex w-full bg-white mt-3 justify-between'>
        <span>{data ? data.address : address.address}</span>
        <button className='w-20 h-8 bg-black text-white cursor-pointer' onClick={handleToggleModal}>
          주소
        </button>
      </section>
      내용
      <textarea
        className='mb-5 w-full h-2/5'
        {...register('content', { required: true })}
        defaultValue={data && data.content}
      />
      <div className='flex items-center justify-center gap-5'>
        {data ? (
          <button className='bg-white mb-5' type='button' onClick={handleEditUpload}>
            수정하기
          </button>
        ) : (
          <button className='bg-white mb-5' type='button' onClick={handleDataUpload}>
            작성하기
          </button>
        )}
        <button className='bg-white mb-5' type='button' onClick={() => navigate(-1)}>
          취소
        </button>
      </div>
    </section>
  );
};

export default Newpost;
