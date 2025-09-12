import React from 'react';

const PhotoTest = () => {
  const photoNames = ['111111', '1010', '999', '888', '777', '666', '555', '444', '333', '222', '111'];
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Photo Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Testing SVG Photos</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {photoNames.map((name, index) => (
              <div key={name} className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={`/survey-photos/${name}.png`}
                    alt={`Photo ${index} - ${name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error(`Failed to load ${name}.png`);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className={`w-full h-full bg-red-100 flex items-center justify-center text-lg hidden`}>
                    ❌
                  </div>
                </div>
                <div className="text-sm font-medium">{index}/10</div>
                <div className="text-xs text-gray-500">{name}.png</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-4">Testing PNG Photos (if they exist)</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {photoNames.map((name, index) => (
              <div key={name} className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={`/survey-photos/${name}.png`}
                    alt={`Photo ${index} - ${name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error(`Failed to load ${name}.png`);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className={`w-full h-full bg-red-100 flex items-center justify-center text-lg hidden`}>
                    ❌
                  </div>
                </div>
                <div className="text-sm font-medium">{index}/10</div>
                <div className="text-xs text-gray-500">{name}.png</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/survey/preview" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Survey Preview
          </a>
        </div>
      </div>
    </div>
  );
};

export default PhotoTest;
