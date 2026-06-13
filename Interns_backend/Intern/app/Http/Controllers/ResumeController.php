<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResumeController extends Controller
{
    public function index(Request $request)
    {
        $userId  = $request->user_id ?? $request->user()->id;
        $resumes = Resume::where('user_id', $userId)->latest()->get();

        return response()->json($resumes);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'resume'    => 'required|file|mimes:pdf,doc,docx|max:5120',
            'is_primary'=> 'boolean',
        ]);

        $file     = $request->file('resume');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $path     = $file->storeAs('resumes', $fileName, 'public');

        if ($request->is_primary) {
            Resume::where('user_id', $request->user()->id)->update(['is_primary' => false]);
        }

        $resume = Resume::create([
            'user_id'    => $request->user()->id,
            'file_name'  => $file->getClientOriginalName(),
            'file_path'  => $path,
            'file_type'  => $file->getMimeType(),
            'file_size'  => $file->getSize(),
            'is_primary' => $request->is_primary ?? false,
        ]);

        return response()->json(['message' => 'Resume uploaded', 'resume' => $resume], 201);
    }

    public function destroy(Resume $resume)
    {
        Storage::disk('public')->delete($resume->file_path);
        $resume->delete();

        return response()->json(['message' => 'Resume deleted']);
    }

    public function setPrimary(Resume $resume)
    {
        Resume::where('user_id', $resume->user_id)->update(['is_primary' => false]);
        $resume->update(['is_primary' => true]);

        return response()->json(['message' => 'Primary resume set']);
    }
}
