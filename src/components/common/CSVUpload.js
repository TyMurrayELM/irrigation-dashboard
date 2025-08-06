import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import { dataService } from '../../services/dataService';

function CSVUpload({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatus({ type: 'info', message: 'Processing CSV file...' });
    setProgress({ current: 0, total: 0 });

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          // Process the CSV data
          const processedData = results.data
            .filter(row => row['Job Name'] && row['Job Name'].trim()) // Filter out empty rows
            .map(row => ({
              name: row['Job Name']?.trim(),
              region: row['Region']?.trim(),
              branch: row['Branch']?.trim(),
              account_manager: row['Account Manager']?.trim(),
              property_type: row['Property Type']?.trim(),
              days_since_irrigation_invoice: parseInt(row['Days Since Irrigation Invoice']) || null,
              days_since_irrigation_visit: parseInt(row['Days Since Irrigation Visit']) || null,
              gate_code: row['Gate Code']?.trim() || null
            }));

          const totalRecords = processedData.length;
          setProgress({ current: 0, total: totalRecords });
          setStatus({ type: 'info', message: `Processing ${totalRecords} properties...` });

          // Update properties in Supabase with progress tracking
          const result = await dataService.bulkUpdatePropertiesWithProgress(
            processedData,
            (current) => {
              setProgress({ current, total: totalRecords });
              setStatus({ 
                type: 'info', 
                message: `Processing property ${current} of ${totalRecords}...` 
              });
            }
          );
          
          if (result.success) {
            setStatus({ 
              type: 'success', 
              message: `Successfully updated ${result.updated} properties and added ${result.added} new properties!` 
            });
            setProgress({ current: 0, total: 0 });
            
            // Reload the properties in the main app
            if (onUploadComplete) {
              onUploadComplete();
            }
          } else {
            setStatus({ 
              type: 'error', 
              message: 'Error updating properties. Please try again.' 
            });
          }
        } catch (error) {
          console.error('Error processing CSV:', error);
          setStatus({ 
            type: 'error', 
            message: 'Error processing CSV file. Please check the format and try again.' 
          });
        } finally {
          setUploading(false);
          setProgress({ current: 0, total: 0 });
          // Clear the file input
          event.target.value = '';
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setStatus({ 
          type: 'error', 
          message: 'Error reading CSV file. Please check the file and try again.' 
        });
        setUploading(false);
        setProgress({ current: 0, total: 0 });
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Update Properties from CSV</h3>
          <p className="text-sm text-gray-600">
            Upload your Master Job List CSV to update property information
          </p>
        </div>
        <div className="flex items-center gap-4">
          {status && (
            <div className={`flex items-center gap-2 text-sm ${
              status.type === 'success' ? 'text-green-600' :
              status.type === 'error' ? 'text-red-600' :
              'text-blue-600'
            }`}>
              {status.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
               status.type === 'error' ? <AlertCircle className="w-4 h-4" /> :
               <Upload className="w-4 h-4 animate-pulse" />}
              <span>{status.message}</span>
            </div>
          )}
          <label className={`flex items-center gap-2 px-4 py-2 ${
            uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-lg cursor-pointer transition-colors min-w-[140px] justify-center`}>
            <Upload className="w-4 h-4" />
            <span>
              {uploading 
                ? (progress.total > 0 
                    ? `${progress.current}/${progress.total}` 
                    : 'Processing...')
                : 'Upload CSV'}
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>
      {uploading && progress.total > 0 && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Processing property {progress.current} of {progress.total}
          </p>
        </div>
      )}
      <div className="mt-4 text-xs text-gray-500">
        Expected columns: Region, Job Name, Branch, Account Manager, Property Type, Days Since Irrigation Invoice, Days Since Irrigation Visit, Gate Code
      </div>
    </div>
  );
}

export default CSVUpload;