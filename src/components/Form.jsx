'use client'

import React, { useState, useEffect } from 'react';

import DetailsCard from './DetailsCard';
import Swal from 'sweetalert2';

export default function Form() {
    const [longURL, setLongURL] = useState('');
    const [customAddress, setCustomAddress] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [token, setToken] = useState('');

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsFetching(true);
            const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: longURL,
                    token,
                    customAddress,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                
                setCustomAddress(data.data.unique);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Shortened Successfully',
                    text: 'Your URL has been successfully shortened!',
                });

                setIsSubmitted(true);
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message;
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `There was an error shortening the URL. ${errorMessage}`,
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Network Error',
                text: 'There was a network error. Please try again later.',
            });
        }
    };

    const handleLongURLChange = (e) => {
        setLongURL(e.target.value);
    };

    const handleCustomAddressChange = (e) => {
        setCustomAddress(e.target.value);
    };
    
    return (
        <>  
            {isSubmitted ? (
                <DetailsCard longURL={longURL} unique={customAddress} />
            ) : (
                <section className="bg-gray-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-md md:w-4/6 mb-12">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Shorten a Long Link</h2>
                        <form onSubmit={handleFormSubmit}>
                            <div className="mb-4">
                                <label className="block text-l text-gray-700 text-sm font-bold mb-2" htmlFor="longURL">
                                Long URL
                                </label>
                                <input
                                    className="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="longURL"
                                    type="text"
                                    placeholder="Example: https://ultra-long-link.com/shorten-it-now"
                                    onChange={handleLongURLChange}
                                />
                            </div>
                            <div className="mb-4">
                                <div className="md:flex">
                                    <div className="w-full md:w-2/6 md:mr-4 mb-4 md:mb-0">
                                        <label className="block text-l text-gray-700 text-sm font-bold mb-2" htmlFor="customAddress1">
                                            Domain
                                        </label>
                                        <input
                                            className="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="customAddress1"
                                            type="text"
                                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/`}
                                            readOnly
                                        />
                                    </div>
                                    <div className="w-full md:w-4/6">
                                        <label className="block text-l text-gray-700 text-sm font-bold mb-2" htmlFor="customAddress2">
                                            Custom Address (optional)
                                        </label>
                                        <input
                                            className="appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="customAddress2"
                                            type="text"
                                            placeholder="Example: AmazingNextJS"
                                            onChange={handleCustomAddressChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert">
                                <span className="font-medium">Custom Address</span> make your URLs more attractive!
                            </div>
                            {isFetching ? (
                                <div className="flex items-center justify-between mt-4">
                                    <button disabled type="button" class="bg-blue-400 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center diss">
                                        <svg aria-hidden="true" role="status" class="inline w-4 h-4 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                                        </svg>
                                        Loading...
                                    </button>
                                </div>
                                

                            ) : (
                                <div className="flex items-center justify-between mt-4">
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        type="submit"
                                    >
                                    Shorten your Long URL
                                    </button>
                                </div>
                            )}
                            
                        </form>
                    </div>
                </section>
            )}
        </>
    );
}